
const isValid=(value)=>{
    if(typeof value==='undefined' || typeof value===null) return false
    if(typeof value==='string' && value.trim().length ===0 ) return false

    return true
}


const isValidEmail = (email) => {
    // This regex pattern checks for a valid email format.
    const regexPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;

    // Use the test() method to check if the email matches the pattern.
    return regexPattern.test(email.trim());
};


module.exports={isValid,isValidEmail}