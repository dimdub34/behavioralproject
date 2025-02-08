let typewriter_response = null;
let typewriter_summary = null;


function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function display_rating() {
    document.querySelector(".rating-container").style.display = "block";
}

function clear_container(container) {
    container.innerHTML = "";
    container.classList.remove("chat-bubble", "bot-bubble");
    if (container === document.querySelector("#summary")) {
        container.classList.remove("summary");
        if (typewriter_summary) {
            typewriter_summary.stop();
            typewriter_summary = null;
        }
    } else if (container === document.querySelector("#response")) {
        if (typewriter_response) {
            typewriter_response.stop();
            typewriter_response = null;
        }
    }
}

function ask_topic() {
    const container = document.querySelector('#topic');

    // récupération des topics
    let topics = Object.keys(data);
    // Ajoute un bouton pour chaque topic
    topics.forEach(topic => {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-outline-secondary', 'mx-1');
        button.type = 'button';
        button.innerHTML = `<i class="bi bi-chat"></i> ${capitalize(topic)}`;

        // effet sélection / déselection
        button.addEventListener('click', () => {
            const buttons = container.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline-secondary');
            });
            button.classList.remove('btn-outline-secondary');
            button.classList.add('btn-primary');

            // Afficher les questions
            display_questions(topic);
        });

        container.appendChild(button);
    });
}

function display_questions(topic) {
    const container = document.querySelector('#questions');
    container.innerHTML = '';
    clear_container(document.querySelector('#response'));
    clear_container(document.querySelector('#summary'));

    const paragraph = document.createElement('p');
    if (language === "en")
        paragraph.textContent = "Please select a question.";
    else if (language === "ro")
        paragraph.textContent = "Vă rugăm să selectați o întrebare.";
    container.appendChild(paragraph);

    const questions = data[topic];
    questions.forEach(question => {
        const btn_question = document.createElement('button');
        btn_question.classList.add('btn', 'btn-outline-secondary', 'mx-1', 'my-1');
        btn_question.type = 'button';
        btn_question.innerHTML = `<i class="bi bi-patch-question"></i> ${question.question}`;

        // effet sélection / déselection
        btn_question.addEventListener('click', () => {
            const buttons = container.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline-secondary');
            });
            btn_question.classList.remove('btn-outline-secondary');
            btn_question.classList.add('btn-primary');

            display_response(topic, question);
        });

        container.appendChild(btn_question);
        container.appendChild(document.createElement('br'));
    });
}

function display_response(topic, question) {
    const container = document.querySelector('#response');
    container.classList.add("chat-bubble", "bot-bubble");
    clear_container(document.querySelector('#summary'));
    const questionObj = data[topic].find(item => item === question);
    const formattedResponse = questionObj.reponse.replace(/\n/g, '<br>');

    // Envoie les données de l'interaction au serveur
    saveInteraction(topic, question.question);

    if (typewriter_response) {
        typewriter_response.stop();
    }
    typewriter_response = new Typewriter(container, {
        loop: false,
        delay: 10,
        cursor: null // Supprime le curseur
    });
    typewriter_response
        .typeString(formattedResponse)
        .callFunction(() => {
            // Appelle display_summary une fois que l'effet est terminé
            display_summary(questionObj);
        })
        .start();
}

function display_summary(question) {
    const container = document.querySelector('#summary');
    container.classList.add('chat-bubble', 'bot-bubble', 'summary')
    const formattedResponse = question.summary.replace(/\n/g, '<br>');

    if (typewriter_summary) {
        typewriter_summary.stop();
    }
    typewriter_summary = new Typewriter(container, {
        loop: false,
        delay: 10,
        cursor: null // Supprime le curseur
    });
    typewriter_summary
        .typeString("<b>Summary</b> <br/>")
        .typeString(formattedResponse)
        .callFunction(() => {
            display_rating();
        })
        .start();
}

function saveInteraction(topic, question) {
    const interactionData = {
        topic: topic,
        question: question,
        timestamp: new Date().toISOString() // Ajoute un horodatage
    };

    fetch('https://www.behavioralproject.org/chatMoldavie/saveinteractions.php', { // Remplace par l'URL de ton fichier PHP
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(interactionData) // Convertit les données en JSON
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de l\'enregistrement de l\'interaction.');
            }
            return response.text();
        })
        .then(data => {
            console.log('Interaction sauvegardée avec succès :', interactionData);
            console.log('Réponse du serveur :', data);
        })
        .catch(error => {
            console.error('Erreur :', error);
        });
}

function config_stars() {
    const stars = document.querySelectorAll('#rating .bi'); // Sélectionne les étoiles
    const ratingValueDisplay = document.getElementById('rating-value'); // Affiche la note sélectionnée

    let currentRating = 0; // Stocke la note sélectionnée

    stars.forEach(star => {
        // Survol : Change les couleurs des étoiles temporairement
        star.addEventListener('mouseover', () => {
            resetStars(); // Réinitialise toutes les étoiles
            highlightStars(star.dataset.value); // Met en surbrillance les étoiles jusqu'à celle survolée
        });

        // Quitter le survol : Restaurer les étoiles sélectionnées
        star.addEventListener('mouseout', () => {
            resetStars();
            highlightStars(currentRating); // Remet en surbrillance les étoiles sélectionnées
        });

        // Clic : Enregistre la note sélectionnée
        star.addEventListener('click', () => {
            currentRating = star.dataset.value; // Enregistre la note
            ratingValueDisplay.textContent = `You rated this ${currentRating} star(s).`; // Affiche la note
            resetStars(); // Réinitialise toutes les étoiles
            highlightStars(currentRating, true); // Met en surbrillance les étoiles sélectionnées
        });
    });

    // Réinitialise toutes les étoiles
    function resetStars() {
        stars.forEach(star => {
            star.classList.remove('filled'); // Supprime l'état "rempli"
            star.classList.replace('bi-star-fill', 'bi-star'); // Remet l'étoile en mode vide
        });
    }

    // Met en surbrillance les étoiles jusqu'à la valeur donnée
    function highlightStars(value, makePermanent = false) {
        stars.forEach(star => {
            if (star.dataset.value <= value) {
                if (makePermanent) {
                    star.classList.add('filled'); // Ajoute l'état "rempli"
                }
                star.classList.replace('bi-star', 'bi-star-fill'); // Change l'icône en étoile pleine
            }
        });
    }
}