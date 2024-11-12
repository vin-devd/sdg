// الأسئلة
const questions = [
    {
        question: "ما هو أول أركان الإسلام؟",
        options: ["الصلاة", "الشهادتين", "الصيام", "الزكاة"],
        correct: 1
    },
    {
        question: "كم عدد ركعات صلاة الظهر؟",
        options: ["أربع ركعات", "ثلاث ركعات", "ركعتين", "خمس ركعات"],
        correct: 0
    },
    {
        question: "في أي شهر هجري يصوم المسلمون؟",
        options: ["شعبان", "رجب", "رمضان", "شوال"],
        correct: 2
    },
    {
        question: "كم عدد أركان الإسلام؟",
        options: ["ثلاثة", "أربعة", "خمسة", "ستة"],
        correct: 2
    }
];

let currentQuestion = 0;
let score = 0;
let timer;

window.onload = async () => {
    try {
        const response = await fetch('/user-info');
        const userData = await response.json();
        
        const avatarElement = document.getElementById('userAvatar');
        if (userData.avatar) {
            avatarElement.src = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`;
        } else {
            avatarElement.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
        }
        
        document.getElementById('username').textContent = userData.username;
    } catch (error) {
        console.error('خطأ في جلب معلومات المستخدم:', error);
        document.getElementById('userAvatar').src = 'https://cdn.discordapp.com/embed/avatars/0.png';
    }
};

document.getElementById('startBtn').addEventListener('click', startQuiz);

function startQuiz() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    showQuestion();
}

function showQuestion() {
    if (currentQuestion >= questions.length) {
        showResult();
        return;
    }

    const question = questions[currentQuestion];
    document.getElementById('question-text').textContent = question.question;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.onclick = () => selectAnswer(index);
        optionsContainer.appendChild(button);
    });

    let timeLeft = 50;
    document.getElementById('timer').textContent = timeLeft;
    
    if (timer) clearInterval(timer);
    
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            selectAnswer(-1);
        }
    }, 1000);
}

function selectAnswer(selectedIndex) {
    clearInterval(timer);
    
    const question = questions[currentQuestion];
    if (selectedIndex === question.correct) {
        score++;
    }
    
    currentQuestion++;
    setTimeout(showQuestion, 1000);
}
async function showResult() {
    const percentage = (score / questions.length) * 100;
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    document.getElementById('final-score').textContent = percentage;

    if (percentage >= 70) {
        try {
            const response = await fetch('/submit-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    points: 220  // تأكد من إرسال points
                })
            });
            
            if (!response.ok) {
                throw new Error('فشل في إرسال النتيجة');
            }
        } catch (error) {
            console.error('خطأ في إرسال النتيجة:', error);
        }
    }
}
document.getElementById('retryBtn').addEventListener('click', () => {
    currentQuestion = 0;
    score = 0;
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
}); 
