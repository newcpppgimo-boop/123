async function getPollResults(pollId) {
    const { data, error } = await supabaseClient
        .rpc('get_poll_results', { p_poll_id: pollId });

    if (error) {
        console.error('Results error:', error);
        return [];
    }

    return data || [];
}

function renderPollResults(results) {
    if (!results.length) return '';

    return `
        <div class="poll-results">
            <strong>Poll Results</strong>
            ${results.map(r => `
                <div class="poll-result-row">
                    <span>${escapeHtml(r.option_text)}</span>
                    <strong>
                        ${Number(r.vote_count)}
                        ${Number(r.vote_count) === 1 ? 'vote' : 'votes'}
                    </strong>
                </div>
            `).join('')}
        </div>
    `;
}

async function loadPolls() {
    const el = document.getElementById('pollList');

    try {
        const { data, error } = await supabaseClient
            .from('polls')
            .select('*,poll_options(*)')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            el.innerHTML = `
                <div class="empty">
                    Poll loading error:<br>
                    ${escapeHtml(error.message)}
                </div>
            `;
            return;
        }

        if (!data || data.length === 0) {
            el.innerHTML = '<div class="empty">No active polls.</div>';
            return;
        }

        const { data: authData } = await supabaseClient.auth.getUser();
        const user = authData?.user;

        let html = '';

        for (const p of data) {
            const results = await getPollResults(p.id);

            html += `
                <article class="form-card">
                    <span class="badge">Active</span>

                    <h2>${escapeHtml(p.title)}</h2>

                    <p>${escapeHtml(p.description || '')}</p>

                    <h3>${escapeHtml(p.question)}</h3>

                    <form class="pollForm" data-id="${p.id}">

                        ${(p.poll_options || []).map(o => `
                            <label class="poll-option">
                                <input
                                    type="radio"
                                    name="poll-${p.id}"
                                    value="${o.id}"
                                    required
                                >
                                ${escapeHtml(o.option_text)}
                            </label>
                        `).join('')}

                        <button
                            class="btn primary"
                            type="submit"
                            ${user ? '' : 'disabled'}
                        >
                            ${user ? 'Submit vote' : 'Login to vote'}
                        </button>

                        <p class="form-msg"></p>

                        <div class="results-container">
                            ${renderPollResults(results)}
                        </div>

                    </form>
                </article>
            `;
        }

        el.innerHTML = html;

        document.querySelectorAll('.pollForm').forEach(form => {
            form.addEventListener('submit', vote);
        });

    } catch (err) {
        console.error(err);

        el.innerHTML = `
            <div class="empty">
                JavaScript error:<br>
                ${escapeHtml(err.message)}
            </div>
        `;
    }
}


async function vote(e) {
    e.preventDefault();

    const form = e.currentTarget;
    const msg = form.querySelector('.form-msg');
    const button = form.querySelector('button');
    const selected = form.querySelector('input:checked');

    msg.textContent = 'Checking your account...';

    try {

        const x = await requireYouth();

        if (!x) {
            msg.textContent = 'Please log in as a youth account first.';
            return;
        }

        if (!selected) {
            msg.textContent = 'Please select an option.';
            return;
        }

        msg.textContent = 'Checking your previous vote...';

        const { data: existing, error: checkError } =
            await supabaseClient
                .from('poll_votes')
                .select('id')
                .eq('poll_id', form.dataset.id)
                .eq('user_id', x.user.id)
                .maybeSingle();

        if (checkError) {
            console.error(checkError);

            msg.textContent =
                'Vote check error: ' + checkError.message;

            return;
        }

        if (existing) {
            msg.textContent =
                'You already voted in this poll.';

            return;
        }

        msg.textContent = 'Submitting vote...';
        button.disabled = true;

        const { error } = await supabaseClient
            .from('poll_votes')
            .insert({
                poll_id: form.dataset.id,
                option_id: selected.value,
                user_id: x.user.id
            });

        if (error) {
            console.error('INSERT ERROR:', error);

            msg.textContent =
                'Vote error: ' + error.message;

            button.disabled = false;

            return;
        }

        msg.textContent =
            '✅ Vote submitted successfully!';

        selected.disabled = true;

        button.textContent = 'Vote submitted';

        const results =
            await getPollResults(form.dataset.id);

        form.querySelector('.results-container').innerHTML =
            renderPollResults(results);

    } catch (err) {

        console.error('VOTE ERROR:', err);

        msg.textContent =
            'Unexpected error: ' + err.message;

        button.disabled = false;
    }
}


loadPolls();
