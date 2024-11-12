const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');
const mongoose = require('mongoose')
const app = express();
const mongodb = "mongodb+srv://dfhh:YeqlAeFzhChutTbL@id.wy06g.mongodb.net/"
mongoose.connect(mongodb, {})
const po = require('./schema/user.js')
const config = {
    clientID: '1305868988915388477',
    clientSecret: 'Hhj3yLDGtdIg7G4LIA6sF0Cefk5d_Drb', 
    callbackURL: 'http://192.168.1.2:8080/auth/discord/callback',
    scope: ['identify', 'guilds']
};

app.use(session({
    secret: 'hidaya-bot-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000 * 60 * 24 
    }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new DiscordStrategy(config, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        return done(null, profile);
    });
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/auth/discord', (req, res, next) => {
    req.session.returnTo = req.headers.referer;
    passport.authenticate('discord')(req, res, next);
});

app.get('/auth/discord/callback', 
    passport.authenticate('discord', { failureRedirect: '/' }),
    (req, res) => {
        const redirectTo = req.session.returnTo || '/quiz';
        delete req.session.returnTo;
        res.redirect(redirectTo);
    }
);

app.get('/quiz', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'quiz.html'));
});

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/auth/discord');
}

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('حدث خطأ في الخادم');
});

app.get('/user-info', checkAuth, async (req, res) => {
    try {
        const user = await po.findOne({ userId: req.user.id });
        const now = new Date();
        const canTakeQuiz = !user || now >= user.nextQuizDate;
        
        res.json({
            id: req.user.id,
            username: req.user.username,
            avatar: req.user.avatar,
            canTakeQuiz: canTakeQuiz,
            nextQuizDate: user ? user.nextQuizDate : now,
            daysRemaining: user ? Math.ceil((user.nextQuizDate - now) / (1000 * 60 * 60 * 24)) : 0
        });
    } catch (error) {
        res.status(500).json({ error: 'حدث خطأ في جلب معلومات المستخدم' });
    }
});

const PORT = 8080;
app.listen(PORT, '192.168.1.2', () => {
    console.log(`Server running at http://192.168.1.2:${PORT}`);
});

const WEBHOOK_URL = "https://discord.com/api/webhooks/1104371889931030599/kc0z2E2jwyvF_TTHnVTz_sel0vh_3lPKYTcvIvGOXTexkR5rStiRBVAtK0C5N9vQDYd8";

app.post('/submit-score', checkAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const username = req.user.username;
        const { points } = req.body;

        const user = await po.findOne({ userId: userId });
        const now = new Date();
        
        if (user && now < user.nextQuizDate) {
            return res.status(403).json({ 
                error: 'لا يمكنك أخذ الاختبار حتى انتهاء المدة المحددة' 
            });
        }

        const nextQuizDate = new Date();
        nextQuizDate.setDate(nextQuizDate.getDate() + 15); 

        if (user) {
            user.points += points;
            user.lastQuizDate = now;
            user.nextQuizDate = nextQuizDate;
            await user.save();
        } else {
            await po.create({
                userId: userId,
                username: username,
                points: points,
                lastQuizDate: now,
                nextQuizDate: nextQuizDate
            });
        }
        const currentPoints = user ? user.points : 0;
        const webhookData = {
            embeds: [{
                title: "✅ اكتمل الاختبار بنجاح!",
                color: 0x02b875,
                fields: [
                    {
                        name: "المستخدم",
                        value: username,
                        inline: true
                    },
                    {
                        name: "النقاط المكتسبة",
                        value: `${points} نقطة`,
                        inline: true
                    },
                    {
                        name: "إجمالي النقاط",
                        value: `${currentPoints} نقطة`,
                        inline: true
                    }
                ],
                timestamp: new Date().toISOString()
            }]
        };

        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(webhookData)
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error processing score:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء معالجة النتيجة' });
    }
});

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ error: 'غير مصرح' });
}