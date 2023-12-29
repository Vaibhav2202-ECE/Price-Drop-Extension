let userEmail;
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'Login' || msg.type === 'Register') {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        let auth = firebase.auth();
        let email = msg.email;
        let password = msg.password;
        if (msg.type === 'Login') {
            auth.signInWithEmailAndPassword(email, password).then(cred => {
                alert('You are logged in');
                chrome.browserAction.setPopup({
                    popup: "home.html"
                })
            }).catch(e => { alert('Wrong username or password') });
            localStorage.setItem('userEmail', email);
        }
        else if (msg.type === 'Register') {
            auth.createUserWithEmailAndPassword(email, password).then(cred => {
                alert('Registered! Login to continue');
            })
        }
    }
    else if (msg.type === 'logOut') {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        let auth = firebase.auth();
        auth.signOut().then(alert('You are logged out'));
        chrome.browserAction.setPopup({
            popup: "popup.html"
        })
    }
    else if (msg.type === 'addProduct') {
        let prodUrl = msg.prodUrl;
        let price = msg.price;
        console.log(prodUrl);
        console.log(price);
        let route = "http://localhost:3000/products";
        $.ajax({
            type: "POST",
            url: route,
            dataType: "json",
            data: {
                prodUrl: prodUrl,
                price: price,
                email: localStorage.getItem('userEmail')
            },
            success: (res) => console.log(res),
            error: () => console.log('An error occured !')
        });
        alert('You will be notified when the price drops.');
    }
});
