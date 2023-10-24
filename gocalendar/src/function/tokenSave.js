const axios = require('axios');
const config = require('../../configApi.json');
const swal = require('sweetalert2');

const verifyAndSaveToken = async () => {
    const response = await axios.post(config.apiAddress+':'+config.apiPort+'/user/token', {
        token: localStorage.getItem('token'),
        user_id: localStorage.getItem('user_id')
    });
    const data = response.data;
    if(response.status == 'ko'){
        await swal({
        title: "Error token",
        text: data.message,
        icon: "error",
        className: "sweetAlert"
        })
    }
    
    localStorage.setItem('token', response.data.accessToken);
    localStorage.setItem('user_id', response.data.user_id);
}

module.exports = {
    verifyAndSaveToken
}
