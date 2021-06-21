
const Client = require("./client");


const SetClient = () => {
    return new Promise((resolve,reject)=>{
        Client.find({ isActive: true })
        .exec()
        .then(docs => {
            resolve(docs[0].ropstenWss);
        })
        .catch(err => {
            console.log(err);
        });
    });
};


module.exports.SetClient = SetClient;