const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

const friends_infoSchema = new mongoose.Schema({
    friend_name: {
        type: String,
        lowercase: true,
        trim: true,
        required: true,
    },
    friend_email: {
        type: String,
        unique: [true, "Email Id Already Present"],
        //IMPORTANT: "isEmail" -> using Validation NPM 👇 line38to42
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is inValid.");
            }
        },
        lowercase: true,
        required: true,
    },
    friend_pwd: {
        type: String,
        required: true,
    },
    friend_confirmpwd: {                    //NOTE:object - {}
        type: String,
        required: true,
    },
    tokens:[{                               //NOTE:array of an object [{}], line33 👇
        token:{
            type: String,
            required: true,
        }
    }]         
});

/* START: IMPORTANT: "JWT" token also a middleware. here to goto "friend_infoTable.js".
    generating tokens
*/
friends_infoSchema.methods.generateAuthToken = async function() {   //NOTE:function definition
    try {
        console.log(this.id);
        const geneToken = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:geneToken});    //Line33 👆
        await this.save();

        console.log("The Generated Token: " + geneToken);
        return geneToken;
    }catch (error) {
        response.send("the error part" + error);
        console.log("the error part" + error);
    }
}
/* END: */

/*  START:NOTE:middleware -> means comes btw 2 things.
    hashing Algorithm (bcrypts) use in friend_infoTable.js 
*/
friends_infoSchema.pre("save", async function (next) {  /*NOTE: I used in post.(signup) */

    if (this.isModified("friend_pwd")) {
        console.log(`The password BEFORE BCRYPT is ${this.friend_pwd}`);
        this.friend_pwd = await bcrypt.hash(this.friend_pwd, 10);   // 10/12 is round for secure.
        console.log(`The password AFTER BCRYPT is ${this.friend_pwd}`);

        //NOTE: because of "undefined" value, "friend_confirmpwd" column will remove from the table.
        this.friend_confirmpwd = await bcrypt.hash(this.friend_pwd, 10);
    }

    next();
})
/* END: */



module.exports = mongoose.model('friends_info', friends_infoSchema);    //NOTE: collection name automatically convert in the Plural form.