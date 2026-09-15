async function loadAnnouncements() {
    const { data, error } = await supabaseClient
        .from('announcements')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

    const el = document.getElementById('announcementList');

    if (error) {
        el.innerHTML = `
            <div class="empty">
                <strong>Supabase Error:</strong><br>
                ${escapeHtml(error.message)}
            </div>
        `;
        console.error('Supabase announcements error:', error);
        return;
    }

    if (!data || data.length === 0) {
        el.innerHTML = '<div class="empty">No published announcements yet.</div>';
        return;
    }

    el.innerHTML = data.map(a => `
        <article class="card">
            ${a.image_url ? `<img src="${escapeHtml(a.image_url)}" alt="" style="width:100%;height:150px;object-fit:cover;border-radius:10px">` : ''}
            <span class="badge">${escapeHtml(a.category)}</span>
            <h3>${escapeHtml(a.title)}</h3>
            <p>${escapeHtml(a.content)}</p>
            <div class="meta">${formatDate(a.created_at)}</div>
        </article>
    `).join('');
}

loadAnnouncements();
