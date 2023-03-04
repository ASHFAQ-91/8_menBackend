require('dotenv').config()
const express = require('express');
const path = require('path');                           //both: st & dy
const hbs = require('hbs');
require("./db/conn");
const friend_info = require("./models/friend_infoTable");
const port = process.env.PORT || 4500;
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());                  //it encode the content for postman.
app.use(express.urlencoded({ extended: false }));  //with that use this encode the content for browser.

// console.log(process.env.SECRET_KEY);        //NOTE: .env - for security - secret_key.

const static_path = path.join(__dirname, "../public");                  //static
const views_path = path.join(__dirname, "../templates/views");          //dynamic
const partials_path = path.join(__dirname, "../templates/partials");    //dy
app.use(express.static(static_path));                                   //st
app.set("view engine", "hbs");                                          //dy
app.set("views", views_path);                                           //dy
hbs.registerPartials(partials_path);                                    //dy


app.get("/", async (req, resp) => {
    try { resp.status(200).render("index"); }
    catch (e) { resp.status(400).send(e); }
});

app.get("/about", async (req, resp) => {
    try { resp.status(200).render("about"); }
    catch (e) { resp.status(400).send(e); }
});

app.get("/signup", async (req, resp) => {
    try { resp.status(200).render("signup"); }
    catch (e) { resp.status(400).send(e); }
});

// IMPORTANT:IMPORTANT: create a new user in our database.
app.post("/signup", async (req, resp) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if (password === cpassword) {
            const signupFriend = new friend_info({
                friend_name: req.body.friendname,
                friend_email: req.body.email,
                friend_pwd: password,
                friend_confirmpwd: req.body.confirmpassword
            });

            //START: IMPORTANT: "JWT" token also a middleware. here to goto "friend_infoTable.js".
            const token = await signupFriend.generateAuthToken();   //NOTE:function call, define in "friend_infoTable" file, line41. 👈
            console.log("the token part: " + token);
            //END:

            /*  NOTE:middleware -> means comes btw 2 things.
                IMPORTANT: hashing Algorithm (bcrypts) use in "friend_infoTable.js".
            */

            const result = await signupFriend.save();       //save in database
            console.log("The result: " + result);
            resp.status(201).render("index");
            // resp.send("DATA SUCCESSFUL INSERTED.");
        }
        else {
            resp.send("password are not matching.");
        }
        // console.log(req.body.friendname);        //show on console
        // resp.send(req.body.friendname);          //show on postman
    }
    catch (error) {
        resp.status(400).send(error);
        console.log("the error part page");
    }
});

app.get("/signin", async (req, resp) => {
    try { resp.status(200).render("signin"); }
    catch (e) { resp.status(400).send(e); }
});

//IMPORTANT: login check
app.post("/signin", async (req, resp) => {
    try {
        const DataEmail = req.body.checkemail;
        const DataPassword = req.body.checkpassword;

        let frd_detail = await friend_info.findOne({ friend_email: DataEmail });
        // resp.send(frd_detail);      //postman & browser
        // console.log(frd_detail);    //print on vsc console or other

        const isMatch = await bcrypt.compare(DataPassword, frd_detail.friend_pwd); //IMPORTANT:bcrypt.

        //START: IMPORTANT: "JWT" token also a middleware. here to goto "friend_infoTable.js".
        const token = await frd_detail.generateAuthToken();   //NOTE:function call, define in "friend_infoTable" file, line41. 👈
        console.log("The token part: " + token);
        //END:

        if (isMatch) {
            resp.status(201).render("index");
        } else {
            resp.send("password are not matching."); //fix for security: invalid login details.
        }
        console.log(isMatch);   //boolean value
        console.log(`${DataEmail} and password is ${DataPassword}\n${frd_detail}`);
    }
    catch (e) { resp.status(400).send("Invalid Login Details") };
});

app.get("*", (req, resp) => {
    const errorMsg = {
        msg: "ERROR 404. The page you're looking for can't be found.",
    }
    resp.render("404error", { errorMsg });
});


app.get("/", async (req, resp) => {         //backup load behalf of index file.
    try {
        resp.status(200).send("Hello from GET ROUTE");
    }
    catch (e) {
        resp.status(400).send(e);
    }
});


app.listen(port, () => {
    console.log(`listening to the port no ${port}`);
});


//POST ROUTE
// app.post("/create", async (req, resp) => {
//     try {
//         let data = new student_info(req.body);
//         let result = await data.save();
//         console.log(result);
//         resp.status(201).send(result);
//     }
//     catch(e) {
//         resp.status(400).send(e);
//     }
// });

// // login check  (extra backup purpose MASQ)
// app.post("/signin", async (req, resp) => {
//     try {
//         const DataEmail = req.body.checkemail;
//         const DataPassword = req.body.checkpassword;

//         let frd_detail = await friend_info.findOne({ friend_email: DataEmail });
//         // resp.send(frd_detail);      //postman & browser
//         // console.log(frd_detail);    //print on vsc console or other

//         if (frd_detail.friend_pwd === DataPassword) {
//             resp.status(200).render("index");
//         } else {
//             resp.send("password are not matching.");    //fix for security: invalid login details.
//         }
//     }
//     catch (e) { resp.status(400).send("Invalid Login Details") };
// });