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
            const icon = btnTheme.querySelector('.JFEJ-plus-action-icon');
            if (icon) icon.textContent = isDark ? '☀️' : '🌙';
        }
        
        const plusCardIcon = document.querySelector('.JFEJ-plus-options .JFEJ-plus-card-icon');
        if (plusCardIcon) {
            plusCardIcon.textContent = isDark ? '☀️' : '🌙';
        }
        
        if (themeLabel) {
            themeLabel.textContent = isDark ? 'Passer au mode clair' : 'Passer au mode sombre';
        }
        localStorage.setItem('JFEJ-theme', theme);
    };
    setTheme(savedTheme);

    if (btnTheme) {
        btnTheme.addEventListener('click', () => {
            const currentTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
            setTheme(currentTheme);
        });
    }

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

        if (avatar) {
            avatar.textContent = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
            if (/^#[0-9a-f]{6}$/i.test(currentUser.profileColor || '')) {
                avatar.style.background = currentUser.profileColor;
            }
        }
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
                const groupButton = document.createElement('button');
                groupButton.className = 'JFEJ-contact';
                groupButton.type = 'button';
                groupButton.setAttribute('data-message-contact', '');
                groupButton.dataset.name = `Groupe ${name}`;
                groupButton.dataset.initials = name.slice(0, 3).toUpperCase();
                groupButton.dataset.class = `Spécialité ${name}`;
                groupButton.dataset.specialties = name;
                groupButton.dataset.status = 'online';
                groupButton.dataset.profileBio = `Canal de discussion et d'entraide dédié à la spécialité ${name}.`;
                groupButton.dataset.color = 'blue';
                groupButton.dataset.messageOne = `Bienvenue sur le canal du groupe ${name} !`;
                groupButton.dataset.messageTwo = `Partagez vos exercices et posez vos questions ici.`;

                const iconElement = document.createElement('span');
                iconElement.className = `JFEJ-contact-avatar ${style}`;
                iconElement.setAttribute('aria-hidden', 'true');
                iconElement.textContent = icon;

                const copyElement = document.createElement('span');
                copyElement.className = 'JFEJ-contact-copy';
                const strongElement = document.createElement('strong');
                strongElement.textContent = `Groupe ${name}`;
                const smallElement = document.createElement('small');
                smallElement.textContent = `Discussion de spécialité`;
                copyElement.append(strongElement, smallElement);

                groupButton.append(iconElement, copyElement);
                specialtyList.append(groupButton);
            });
        }
    }

    if (btnToggleSidebar) {
        btnToggleSidebar.addEventListener('click', () => {
            appContainer.classList.toggle('is-collapsed');
            btnToggleSidebar.textContent = appContainer.classList.contains('is-collapsed') ? '▶' : '◀';
        });
    }

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
            link.dataset.profileName = contact.name;
            link.dataset.profileInitials = contact.initials;
            link.dataset.profileClass = contact.className || 'Élève';
            link.dataset.profileSpecialties = contact.specialties || 'Aucune spécialité';
            link.dataset.profileStatus = contact.status || 'online';
            link.dataset.profileBio = contact.bio || 'Aucune biographie renseignée.';
            link.dataset.profileColor = contact.color || 'violet';

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

    const initMessaging = () => {
        const messageContacts = document.querySelectorAll('[data-message-contact]');
        if (messageContacts.length === 0) return;

        const profilePanel = document.getElementById('contactProfilePanel');
        const profileToggle = document.getElementById('btnToggleProfilePanel');
        const profileFriendBtn = document.getElementById('profilePanelFriendBtn');
        const profileName = document.getElementById('profileName');
        const profileAvatar = document.getElementById('profileAvatar');
        const profileClass = document.getElementById('profileClass');
        const profileSpecialties = document.getElementById('profileSpecialties');
        const profileStatus = document.getElementById('profileStatus');
        const profileStatusDot = document.getElementById('profileStatusDot');
        const profileBio = document.getElementById('profileBio');
        const conversationName = document.getElementById('conversationName');
        const conversationAvatar = document.getElementById('conversationAvatar');
        const conversationStatus = document.getElementById('conversationStatus');
        const conversationStatusDot = document.getElementById('conversationStatusDot');
        const messageAuthor = document.getElementById('messageAuthor');
        const messageAvatar = document.getElementById('messageAvatar');
        const incomingMessage = document.getElementById('incomingMessage');
        const replyMessage = document.getElementById('replyMessage');

        messageContacts.forEach((contact) => {
            const nameElement = contact.querySelector('.JFEJ-contact-copy strong');
            const avatarElement = contact.querySelector('.JFEJ-contact-avatar');
            const safeProfileName = contact.dataset.profileName || contact.dataset.name || nameElement?.textContent.trim() || 'Inconnu';
            const safeProfileInitials = contact.dataset.profileInitials || contact.dataset.initials || (safeProfileName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '??');
            const safeProfileClass = contact.dataset.profileClass || contact.dataset.class || 'Élève';
            const safeProfileSpecialties = contact.dataset.profileSpecialties || contact.dataset.specialties || 'Aucune spécialité';
            const safeProfileStatus = contact.dataset.profileStatus || contact.dataset.status || 'online';
            const safeProfileBio = contact.dataset.profileBio || contact.dataset.bio || 'Aucune biographie renseignée.';
            const safeProfileColor = contact.dataset.profileColor || contact.dataset.color || 'violet';

            contact.dataset.profileName = safeProfileName;
            contact.dataset.profileInitials = safeProfileInitials;
            contact.dataset.profileClass = safeProfileClass;
            contact.dataset.profileSpecialties = safeProfileSpecialties;
            contact.dataset.profileStatus = safeProfileStatus;
            contact.dataset.profileBio = safeProfileBio;
            contact.dataset.profileColor = safeProfileColor;
        });

        const updateProfilePanelVisibility = (isVisible) => {
            if (!profilePanel) return;
            profilePanel.classList.toggle('is-open', isVisible);
            profilePanel.classList.toggle('is-hidden', !isVisible);
            const app = document.querySelector('.JFEJ-messages-app');
            if (app) app.classList.toggle('has-profile-panel', isVisible);
            if (profileToggle) {
                profileToggle.textContent = isVisible ? 'Masquer le profil' : 'Profil';
                profileToggle.setAttribute('aria-expanded', String(isVisible));
            }
        };

        const updateFriendButton = (name) => {
            if (!profileFriendBtn) return;
            const friends = JSON.parse(localStorage.getItem('jfej_friends') || '[]');
            profileFriendBtn.textContent = friends.some((friend) => friend.name === name) ? '✓ Ami ajouté' : '+ Ajouter en amis';
        };

        const setContact = (contact) => {
            const { profileName: name, profileInitials: initials, profileClass: className, profileSpecialties: specialties, profileStatus: status, profileBio: bio, profileColor: color, messageOne, messageTwo } = contact.dataset;
            const isOnline = status === 'online';
            const presenceText = isOnline ? 'En ligne' : 'Hors ligne';
            const isGroup = !!(contact.closest('.JFEJ-club-list') || contact.dataset.profileGroup === 'true');

            messageContacts.forEach((item) => {
                const isSelected = item === contact;
                item.classList.toggle('is-selected', isSelected);
                item.setAttribute('aria-pressed', String(isSelected));
            });

            if (profileName) {
                profileName.textContent = name;
                profileName.dataset.profileName = name;
                profileName.dataset.profileInitials = initials;
                profileName.dataset.profileClass = className;
                profileName.dataset.profileSpecialties = specialties;
                profileName.dataset.profileStatus = status;
                profileName.dataset.profileBio = bio;
                profileName.dataset.profileColor = color;
            }
            if (profileToggle) {
                profileToggle.disabled = isGroup;
                updateProfilePanelVisibility(!isGroup && profilePanel?.classList.contains('is-open'));
            }
            if (profileClass) profileClass.textContent = className;
            if (profileSpecialties) profileSpecialties.textContent = specialties;
            if (profileStatus) profileStatus.textContent = presenceText;
            if (profileStatusDot) profileStatusDot.classList.toggle('is-online', isOnline);
            if (profileBio) profileBio.textContent = bio;

            if (conversationName) {
                conversationName.textContent = name;
                conversationName.dataset.profileName = name;
                conversationName.dataset.profileInitials = initials;
                conversationName.dataset.profileClass = className;
                conversationName.dataset.profileSpecialties = specialties;
                conversationName.dataset.profileStatus = status;
                conversationName.dataset.profileBio = bio;
                conversationName.dataset.profileColor = color;
            }
            if (conversationStatus) conversationStatus.textContent = presenceText;
            if (conversationStatusDot) conversationStatusDot.classList.toggle('is-online', isOnline);

            if (messageAuthor) {
                messageAuthor.textContent = name;
                messageAuthor.dataset.profileName = name;
                messageAuthor.dataset.profileInitials = initials;
                messageAuthor.dataset.profileClass = className;
                messageAuthor.dataset.profileSpecialties = specialties;
                messageAuthor.dataset.profileStatus = status;
                messageAuthor.dataset.profileBio = bio;
                messageAuthor.dataset.profileColor = color;
            }
            if (incomingMessage) incomingMessage.textContent = messageOne || 'Bienvenue dans la conversation !';
            if (replyMessage) replyMessage.textContent = messageTwo || 'Envoyez un message pour commencer.';

            const contactAvatar = contact.querySelector('.JFEJ-contact-avatar');
            [profileAvatar, conversationAvatar, messageAvatar].forEach((avatar) => {
                if (!avatar) return;
                const textSpan = avatar.querySelector('span:not(.JFEJ-presence)') || avatar;
                if (textSpan && textSpan !== avatar) textSpan.textContent = initials;
                else avatar.childNodes[0].nodeValue = initials;

                avatar.className = avatar.className.replace(/avatar-\w+|club-\w+/g, '').trim();
                if (contactAvatar) {
                    const matchedClass = Array.from(contactAvatar.classList).find(c => c.startsWith('avatar-') || c.startsWith('club-'));
                    if (matchedClass) avatar.classList.add(matchedClass);
                }
                const presence = avatar.querySelector('.JFEJ-presence');
                if (presence) presence.classList.toggle('is-online', isOnline);
            });
        };

        if (profileToggle) {
            profileToggle.addEventListener('click', () => {
                const shouldOpen = !profilePanel?.classList.contains('is-open');
                if (profileToggle.disabled) return;
                updateProfilePanelVisibility(shouldOpen);
            });
        }

        if (profileFriendBtn) {
            profileFriendBtn.addEventListener('click', () => {
                const activeName = profileName?.textContent?.trim() || 'Inconnu';
                const friends = JSON.parse(localStorage.getItem('jfej_friends') || '[]');
                const exists = friends.some((friend) => friend.name === activeName);
                if (exists) {
                    const nextFriends = friends.filter((friend) => friend.name !== activeName);
                    localStorage.setItem('jfej_friends', JSON.stringify(nextFriends));
                    profileFriendBtn.textContent = '+ Ajouter en amis';
                    return;
                }
                friends.push({ name: activeName, addedAt: new Date().toISOString() });
                localStorage.setItem('jfej_friends', JSON.stringify(friends));
                profileFriendBtn.textContent = '✓ Ami ajouté';
            });
        }

        messageContacts.forEach((contact) => {
            contact.addEventListener('click', () => {
                const isGroup = !!(contact.closest('.JFEJ-club-list') || contact.dataset.profileGroup === 'true');
                setContact(contact);
                if (isGroup) {
                    updateProfilePanelVisibility(false);
                    profileToggle.disabled = true;
                    return;
                }
                profileToggle.disabled = false;
                updateProfilePanelVisibility(false);
            });
        });

        const requestedContact = new URLSearchParams(window.location.search).get('contact');
        const selectedContact = Array.from(messageContacts).find((contact) => (
            normalizeSearchText(contact.dataset.profileName || contact.dataset.name || '') === normalizeSearchText(requestedContact || '')
        )) || messageContacts[0];

        if (selectedContact) {
            setContact(selectedContact);
            const selectedIsGroup = !!(selectedContact.closest('.JFEJ-club-list') || selectedContact.dataset.profileGroup === 'true');
            profileToggle.disabled = selectedIsGroup;
            updateProfilePanelVisibility(false);
        } else {
            if (profileToggle) profileToggle.disabled = true;
            updateProfilePanelVisibility(false);
        }
    };

    initMessaging();

});