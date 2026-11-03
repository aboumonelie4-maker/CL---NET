document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('appContainer');
    const btnToggleSidebar = document.getElementById('btnToggleSidebar');
    const btnSearch = document.getElementById('btnSearch');
    const searchPanel = document.getElementById('searchPanel');
    const searchClose = document.querySelector('.JFEJ-search-close');
    const searchBackdrop = document.querySelector('.JFEJ-search-backdrop');
    const btnTheme = document.getElementById('btnTheme');
    const themeLabel = document.getElementById('themeLabel');
    const accountActions = document.getElementById('plusAccountActions');
    const quickLogoutButton = document.getElementById('btn-quick-logout');
    const deleteAccountButton = document.getElementById('btn-delete-account');
    const currentUserRaw = sessionStorage.getItem('jfej_current_user');
    const currentUser = currentUserRaw ? JSON.parse(currentUserRaw) : null;
    const savedTheme = localStorage.getItem('JFEJ-theme') || 'light';
    const normalizeSearchText = (value) => value
        .toLocaleLowerCase('fr')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    const searchableContacts = [
        {
            name: 'Lucas Bernard',
            initials: 'LB',
            preview: 'Tu as avancé sur le devoir de physique ?',
            messages: [
                'Tu as avancé sur le devoir de physique ?',
                "Oui, je viens de terminer l'exercice 4. Je t'envoie ma méthode !"
            ],
            color: 'violet'
        },
        {
            name: 'Sarah K.',
            initials: 'SK',
            preview: 'On se retrouve au CDI ?',
            messages: [
                'On se retrouve au CDI à la pause de 10h ?',
                "Oui, je t'attends devant l'entrée."
            ],
            color: 'rose'
        },
        {
            name: 'Emma Petit',
            initials: 'EP',
            preview: 'Merci pour la fiche de révision !',
            messages: [
                'Merci pour la fiche de révision !',
                "Avec plaisir, j'ajouterai la partie sur la génétique demain."
            ],
            color: 'blue'
        },
        {
            name: 'Yanis Moreau',
            initials: 'YM',
            preview: 'Tu peux m’aider pour le code Python ?',
            messages: [
                'Tu peux m’aider pour le code Python ?',
                "Bien sûr ! Envoie-moi l'énoncé et on regarde ça ensemble."
            ],
            color: 'orange'
        }
    ];

const setTheme = (theme) => {
        const isDark = theme === 'dark';
        document.body.classList.toggle('dark-mode', isDark);
        document.body.classList.toggle('light-mode', !isDark);
        
        if (btnTheme) {
            btnTheme.setAttribute('aria-pressed', String(isDark));
            
            // Met à jour l'émoji à l'intérieur du bouton d'action
            const icon = btnTheme.querySelector('.JFEJ-plus-action-icon');
            if (icon) icon.textContent = isDark ? '☀️' : '🌙';
        }
        
        // Met à jour l'émoji de l'icône principale de la carte "Apparence"
        const plusCardIcon = document.querySelector('.JFEJ-plus-options .JFEJ-plus-card-icon');
        if (plusCardIcon) {
            plusCardIcon.textContent = isDark ? '☀️' : '🌙';
        }
        
        if (themeLabel) {
            themeLabel.textContent = isDark ? 'Passer au mode clair' : 'Passer au mode sombre';
        }
    };
    setTheme(savedTheme);

    if (accountActions && currentUser) accountActions.hidden = false;

    quickLogoutButton?.addEventListener('click', () => {
        if (!window.confirm('Voulez-vous vraiment vous déconnecter ?')) return;
        sessionStorage.removeItem('jfej_current_user');
        window.location.href = document.body.dataset.logoutUrl || '../../JFEJ/HTML/profil.html';
    });

    deleteAccountButton?.addEventListener('click', () => {
        if (!currentUser) return;
        const confirmed = window.confirm(
            'Voulez-vous vraiment supprimer votre compte ? Cette action est définitive et supprimera vos informations enregistrées sur cet appareil.'
        );
        if (!confirmed) return;

        const usersRaw = localStorage.getItem('jfej_users');
        if (usersRaw === null) {
            window.alert("Impossible de trouver les comptes enregistrés. Votre compte n'a pas été supprimé.");
            return;
        }

        const users = JSON.parse(usersRaw);
        if (!Array.isArray(users)) {
            window.alert("Les données des comptes sont illisibles. Votre compte n'a pas été supprimé.");
            return;
        }

        const email = currentUser.email?.trim().toLowerCase();
        const remainingUsers = users.filter(
            (user) => user.email?.trim().toLowerCase() !== email
        );
        if (!email || remainingUsers.length === users.length) {
            window.alert("Votre compte n'a pas été trouvé dans les comptes enregistrés.");
            return;
        }

        localStorage.setItem('jfej_users', JSON.stringify(remainingUsers));
        sessionStorage.removeItem('jfej_current_user');
        window.location.replace(
            document.body.dataset.accountHomeUrl || '../../JFEJ/HTML/index.html'
        );
    });

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
        const searchInput = searchPanel.querySelector('.JFEJ-search-input');
        let suggestions = searchPanel.querySelector('.JFEJ-search-suggestions');

        if (searchInput && !suggestions) {
            suggestions = document.createElement('div');
            suggestions.className = 'JFEJ-search-suggestions';
            suggestions.id = 'searchSuggestions';
            suggestions.setAttribute('role', 'region');
            suggestions.setAttribute('aria-label', 'Suggestions de recherche');
            suggestions.setAttribute('aria-live', 'polite');
            suggestions.setAttribute('aria-hidden', 'true');
            suggestions.inert = true;
            searchInput.setAttribute('aria-controls', suggestions.id);
            searchInput.insertAdjacentElement('afterend', suggestions);
        }

        const messageUrl = (name) => `Messages.html?contact=${encodeURIComponent(name)}`;

        const createResult = (contact, title, detail, kind, index) => {
            const link = document.createElement('a');
            link.className = 'JFEJ-search-result';
            link.href = messageUrl(contact.name);
            link.style.setProperty('--result-index', String(index));

            const avatar = document.createElement('span');
            avatar.className = `JFEJ-search-result-avatar avatar-${contact.color}`;
            avatar.setAttribute('aria-hidden', 'true');
            avatar.textContent = contact.initials;

            const copy = document.createElement('span');
            copy.className = 'JFEJ-search-result-copy';
            const titleElement = document.createElement('strong');
            titleElement.textContent = title;
            const detailElement = document.createElement('span');
            detailElement.textContent = detail;
            copy.append(titleElement, detailElement);

            const type = document.createElement('span');
            type.className = 'JFEJ-search-result-type';
            type.textContent = kind;
            link.append(avatar, copy, type);
            return link;
        };

        const updateSuggestions = () => {
            if (!searchInput || !suggestions) return;
            const query = normalizeSearchText(searchInput.value.trim());
            suggestions.replaceChildren();

            if (!query) {
                suggestions.classList.remove('is-visible');
                suggestions.setAttribute('aria-hidden', 'true');
                suggestions.inert = true;
                return;
            }

            const people = searchableContacts.filter((contact) => normalizeSearchText(contact.name).includes(query));
            const discussions = searchableContacts.flatMap((contact) => contact.messages
                .filter((message) => normalizeSearchText(message).includes(query))
                .map((message) => ({ contact, message })))
                .slice(0, 4);
            let resultIndex = 0;

            const appendGroup = (label, results, createItem) => {
                if (results.length === 0) return;
                const group = document.createElement('section');
                group.className = 'JFEJ-search-result-group';
                const heading = document.createElement('h3');
                heading.textContent = label;
                const list = document.createElement('div');
                list.className = 'JFEJ-search-result-list';
                results.forEach((result) => {
                    list.append(createItem(result, resultIndex));
                    resultIndex += 1;
                });
                group.append(heading, list);
                suggestions.append(group);
            };

            appendGroup('Personnes', people, (contact, index) => createResult(
                contact,
                contact.name,
                contact.preview,
                'Profil',
                index
            ));
            appendGroup('Discussions', discussions, ({ contact, message }, index) => createResult(
                contact,
                contact.name,
                message,
                'Message',
                index
            ));

            if (resultIndex === 0) {
                const emptyMessage = document.createElement('p');
                emptyMessage.className = 'JFEJ-search-empty';
                emptyMessage.textContent = 'Aucun utilisateur ou message trouvé.';
                suggestions.append(emptyMessage);
            }

            suggestions.classList.add('is-visible');
            suggestions.setAttribute('aria-hidden', 'false');
            suggestions.inert = false;
        };

        const setSearchOpen = (isOpen, restoreFocus = false) => {
            searchPanel.classList.toggle('is-open', isOpen);
            searchPanel.setAttribute('aria-hidden', String(!isOpen));
            searchPanel.inert = !isOpen;
            btnSearch.setAttribute('aria-expanded', String(isOpen));
            if (searchBackdrop) searchBackdrop.classList.toggle('is-open', isOpen);

            if (isOpen) {
                updateSuggestions();
                searchInput?.focus();
            } else if (restoreFocus) {
                btnSearch.focus();
            }
        };

        setSearchOpen(false);
        searchInput?.addEventListener('input', updateSuggestions);

        btnSearch.addEventListener('click', (e) => {
            e.preventDefault();
            setSearchOpen(!searchPanel.classList.contains('is-open'));
        });

        searchClose?.addEventListener('click', () => setSearchOpen(false, true));
        searchBackdrop?.addEventListener('click', () => setSearchOpen(false, true));

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchPanel.classList.contains('is-open')) {
                setSearchOpen(false, true);
            }
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

        const requestedContact = new URLSearchParams(window.location.search).get('contact');
        const selectedContact = Array.from(messageContacts).find((contact) => (
            normalizeSearchText(contact.dataset.name) === normalizeSearchText(requestedContact || '')
        ));
        if (selectedContact) setContact(selectedContact);
    }

    if (btnTheme) {
        btnTheme.addEventListener('click', () => {
            const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
            localStorage.setItem('JFEJ-theme', nextTheme);
            setTheme(nextTheme);
        });
    }
});