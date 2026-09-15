async function getPollResults(pollId) {
    const { data, error } = await supabaseClient
        .rpc('get_poll_results', { p_poll_id: pollId });

    if (error) {
        console.error('Poll results error:', error);
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
                    <strong>${Number(r.vote_count)} vote${Number(r.vote_count) === 1 ? '' : 's'}</strong>
                </div>
            `).join('')}
        </div>
    `;
}

async function loadPolls() {
    const el = document.getElementById('pollList');

    const { data, error } = await supabaseClient
        .from('polls')
        .select('*,poll_options(*)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (error) {
        el.innerHTML = `
            <div class="empty">
                Unable to load polls.<br>
                ${escapeHtml(error.message)}
            </div>
        `;
        console.error('Poll loading error:', error);
        return;
    }

    if (!data?.length) {
        el.innerHTML = '<div class="empty">No active polls.</div>';
        return;
    }

    const { data: { user } } = await supabaseClient.auth.getUser();

    const pollsWithResults = await Promise.all(
        data.map(async poll => ({
            poll,
            results: await getPollResults(poll.id)
        }))
    );

    el.innerHTML = pollsWithResults.map(({ poll: p, results }) => `
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
    `).join('');

    document.querySelectorAll('.pollForm')
        .forEach(form => form.addEventListener('submit', vote));
}

async function vote(e) {
    e.preventDefault();

    const x = await requireYouth();
    if (!x) return;

    const f = e.currentTarget;
    const selected = f.querySelector('input:checked');

    if (!selected) return;

    const opt = selected.value;
    const msg = f.querySelector('.form-msg');
    const resultsContainer = f.querySelector('.results-container');

    const { data: existing } = await supabaseClient
        .from('poll_votes')
        .select('id')
        .eq('poll_id', f.dataset.id)
        .eq('user_id', x.user.id)
        .maybeSingle();

    if (existing) {
        msg.textContent = 'You already voted in this poll.';

        const results = await getPollResults(f.dataset.id);
        resultsContainer.innerHTML = renderPollResults(results);

        return;
    }

    const { error } = await supabaseClient
        .from('poll_votes')
        .insert({
            poll_id: f.dataset.id,
            option_id: opt,
            user_id: x.user.id
        });

    if (error) {
        msg.textContent = error.message;
        console.error('Vote error:', error);
        return;
    }

    msg.textContent = 'Vote submitted successfully.';

    const results = await getPollResults(f.dataset.id);

    resultsContainer.innerHTML = renderPollResults(results);

    f.querySelectorAll('input').forEach(input => {
        input.disabled = true;
    });

    const button = f.querySelector('button[type="submit"]');

    if (button) {
        button.disabled = true;
        button.textContent = 'Vote submitted';
    }
}

loadPolls();
