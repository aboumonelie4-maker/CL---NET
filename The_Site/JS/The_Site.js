document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('appContainer');
    const btnToggleSidebar = document.getElementById('btnToggleSidebar');
    const btnSearch = document.getElementById('btnSearch');
    const searchPanel = document.getElementById('searchPanel');
    const btnTheme = document.getElementById('btnTheme');
    const themeLabel = document.getElementById('themeLabel');
    const currentUserRaw = sessionStorage.getItem('jfej_current_user');
    const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
    const savedTheme = localStorage.getItem('JFEJ-theme') || 'light';

    const setTheme = (theme) => {
        const isDark = theme === 'dark';
        document.body.classList.toggle('dark-mode', isDark);
        document.body.classList.toggle('light-mode', !isDark);
        if (btnTheme) {
            btnTheme.setAttribute('aria-pressed', String(isDark));
            const icon = btnTheme.querySelector('.JFEJ-plus-action-icon');
            if (icon) icon.textContent = isDark ? '☀️' : '🌙';
        }
        if (themeLabel) themeLabel.textContent = isDark ? 'Passer au mode clair' : 'Passer au mode sombre';
    };

    setTheme(savedTheme);

    if (currentUser) {
        const firstName = currentUser.prenom || 'Élève';
        const lastName = currentUser.nom || '';
        const avatar = document.querySelector('.JFEJ-user .JFEJ-avatar');
        const username = document.querySelector('.JFEJ-user .JFEJ-username');
        const userRole = document.querySelector('.JFEJ-user .JFEJ-userrole');

        if (avatar) avatar.textContent = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
        if (username) username.textContent = `${firstName} ${lastName}`.trim();
        if (userRole) userRole.textContent = currentUser.classe || 'Élève';
    }

    const specialtyList = document.getElementById('userSpecialties');
    if (specialtyList) {
        const specialtyAliases = {
            'Mathématiques': 'Mathématique',
            'Physique': 'Physique-Chimie',
            'SVT': 'Science de la Vie et de la Terre',
            'SES': 'Sciences Économiques et Sociales (SES)',
            'HGGSP': 'Histoire-Géographie, Géopolitique et Sciences Politiques(HGGSP)',
            'HLP': 'Humanités, Littérature et Philosophie (HLP)',
            'LLCER': 'Langues, littératures et cultures étrangères et régionales (LLCER - Anglais)',
            'LLCER Anglais': 'Langues, littératures et cultures étrangères et régionales (LLCER - Anglais)'
        };
        const specialties = currentUser
            ? (Array.isArray(currentUser.specialite) ? currentUser.specialite : currentUser.specialite ? [currentUser.specialite] : [])
            : [];
        const specialtyDetails = specialties.filter(Boolean).map((specialty) => {
            const name = specialtyAliases[specialty] || specialty;
            if (name.includes('NSI')) return { name: 'NSI', icon: '{ }', style: 'club-nsi' };
            if (name.includes('Math')) return { name: 'Mathématiques', icon: '∑', style: 'club-maths' };
            if (name.includes('Physique')) return { name: 'Physique-Chimie', icon: '⚛', style: 'club-physique' };
            if (name.includes('Terre') || name.includes('SVT')) return { name: 'SVT', icon: '♧', style: 'club-svt' };
            if (name.includes('Économiques') || name.includes('(SES)')) return { name: 'SES', icon: '€', style: 'club-ses' };
            if (name.includes('Géopolitique') || name.includes('HGGSP')) return { name: 'HGGSP', icon: '🌍', style: 'club-hggsp' };
            if (name.includes('Humanités') || name.includes('(HLP)')) return { name: 'HLP', icon: '✎', style: 'club-hlp' };
            if (name.includes('LLCER')) return { name: 'LLCER', icon: '文', style: 'club-llcer' };
            return { name, icon: '📚', style: 'club-other' };
        });

        specialtyList.replaceChildren();
        if (specialtyDetails.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'JFEJ-clubs-empty';
            emptyMessage.textContent = currentUser
                ? 'Aucune spécialité renseignée dans votre compte.'
                : 'Connectez-vous et choisissez vos spécialités depuis votre compte.';
            specialtyList.append(emptyMessage);
        } else {
            specialtyDetails.forEach(({ name, icon, style }) => {
                const link = document.createElement('a');
                link.href = '../../JFEJ/HTML/vie-scolaire.html#clubs-grid';
                const iconElement = document.createElement('span');
                iconElement.className = `JFEJ-club-icon ${style}`;
                iconElement.setAttribute('aria-hidden', 'true');
                iconElement.textContent = icon;
                const nameElement = document.createElement('span');
                nameElement.textContent = name;
                link.append(iconElement, nameElement);
                specialtyList.append(link);
            });
        }
    }

    // Réduire / Agrandir le menu
    if (btnToggleSidebar) {
        btnToggleSidebar.addEventListener('click', () => {
            appContainer.classList.toggle('is-collapsed');
            btnToggleSidebar.textContent = appContainer.classList.contains('is-collapsed') ? '▶' : '◀';
        });
    }

    // Ouvrir / Fermer le panneau de recherche
    if (btnSearch && searchPanel) {
        btnSearch.addEventListener('click', (e) => {
            e.preventDefault();
            searchPanel.classList.toggle('is-open');
        });
    }

    const messageContacts = document.querySelectorAll('[data-message-contact]');
    if (messageContacts.length > 0) {
        const profileName = document.getElementById('profileName');
        const profileAvatar = document.getElementById('profileAvatar');
        const profileClass = document.getElementById('profileClass');
        const profileSpecialties = document.getElementById('profileSpecialties');
        const profileStatus = document.getElementById('profileStatus');
        const profileStatusDot = document.getElementById('profileStatusDot');
        const conversationName = document.getElementById('conversationName');
        const conversationAvatar = document.getElementById('conversationAvatar');
        const conversationStatus = document.getElementById('conversationStatus');
        const conversationStatusDot = document.getElementById('conversationStatusDot');
        const messageAuthor = document.getElementById('messageAuthor');
        const messageAvatar = document.getElementById('messageAvatar');
        const incomingMessage = document.getElementById('incomingMessage');
        const replyMessage = document.getElementById('replyMessage');

        const setContact = (contact) => {
            const { name, initials, class: className, specialties, status, messageOne, messageTwo } = contact.dataset;
            const isOnline = status === 'online';
            const presenceText = isOnline ? 'En ligne' : 'Hors ligne';

            messageContacts.forEach((item) => {
                const isSelected = item === contact;
                item.classList.toggle('is-selected', isSelected);
                item.setAttribute('aria-pressed', String(isSelected));
            });

            if (profileName) profileName.textContent = name;
            if (profileClass) profileClass.textContent = className;
            if (profileSpecialties) profileSpecialties.textContent = specialties;
            if (profileStatus) profileStatus.textContent = presenceText;
            if (profileStatusDot) profileStatusDot.classList.toggle('is-online', isOnline);
            if (conversationName) conversationName.textContent = name;
            if (conversationStatus) conversationStatus.textContent = presenceText;
            if (conversationStatusDot) conversationStatusDot.classList.toggle('is-online', isOnline);
            if (messageAuthor) messageAuthor.textContent = name;
            if (incomingMessage) incomingMessage.textContent = messageOne;
            if (replyMessage) replyMessage.textContent = messageTwo;

            const contactAvatar = contact.querySelector('.JFEJ-contact-avatar');
            [profileAvatar, conversationAvatar, messageAvatar].forEach((avatar) => {
                if (!avatar || !contactAvatar) return;
                avatar.firstChild.textContent = initials;
                avatar.classList.remove('avatar-violet', 'avatar-rose', 'avatar-blue', 'avatar-orange');
                const colorClass = Array.from(contactAvatar.classList).find((className) => className.startsWith('avatar-'));
                if (colorClass) avatar.classList.add(colorClass);
                const presence = avatar.querySelector('.JFEJ-presence');
                if (presence) presence.classList.toggle('is-online', isOnline);
            });
        };

        messageContacts.forEach((contact) => {
            contact.addEventListener('click', () => setContact(contact));
        });
    }

    if (btnTheme) {
        btnTheme.addEventListener('click', () => {
            const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
            localStorage.setItem('JFEJ-theme', nextTheme);
            setTheme(nextTheme);
        });
    }
});