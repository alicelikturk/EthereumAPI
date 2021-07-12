const Client = require("./client");


const SetClient = (isWss) => {
    return new Promise((resolve, reject) => {
        Client.find({ isActive: true })
            .exec()
            .then(docs => {
                if (docs.length > 0) {
                    if (isWss === true) {
                        resolve(docs[0].ropstenWss);
                    }else{
                        resolve(docs[0].ropstenHttp);
                    }
                }
            })
            .catch(err => {
                console.log(err);
            });
    });
};


module.exports.SetClient = SetClient;