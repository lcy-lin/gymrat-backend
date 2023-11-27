class check {
    static validJsonHeader(header) {

        if(!header || header != 'application/json'){
            return false;
        }
        return true;
    }
    static validBody(name, email, password){
        const nameRegex = /^[a-zA-Z0-9]+$/;
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        const passwordRegex = /^(?=(?:[^A-Z]*[A-Z])?)(?=(?:[^a-z]*[a-z])?)(?=(?:\D*\d)?)(?=(?:[^\w]*[\w\W])?).{8,}$/;

        if(!nameRegex.test(name) || !emailRegex.test(email) || !passwordRegex.test(password)){
            return false;
        }
        return true;
    }
    static authHeader(header){

        const authHeader = header;
        const token = authHeader && authHeader.split(' ')[1];
        if(token == null){
            return null;
        }
        return token;
    }
}
export default check;