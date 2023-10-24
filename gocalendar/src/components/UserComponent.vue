<script>
    import { defineComponent, ref } from 'vue';
    import axios from 'axios';
    import router from '../router/router';
    import swal from 'sweetalert2';
    import config from '../../configApi.json';
    import utils from '../function/utils';

    let adminLogin = true;

    const databody = {user_id:localStorage.getItem("user_id")}

    let user = await utils.callApi(databody, '/user/settings', 'post')

    export default defineComponent({
        created() {
            this.setInput()
        },
        methods:{
            setInput(){
                console.log(user)
                this.username = ref(user.username)
                this.oldPass = ref('')
                this.newPass = ref('')
                this.mail = ref(user.mail)
                this.notification = ref(user.notification)
                this.graph_setting = ref(user.graph_setting)
            },
            switchMenuSettings(bool){
                this.calendarSettings = bool
                this.userSettings = !bool
                this.adminList = false
            },
            async switchAdminList(){

                let result;
                if(adminLogin){
                    result = await swal.fire({
                        title: 'Login Form',
                        html: `<input type="text" id="login" class="swal2-input" placeholder="Username">
                        <input type="password" id="password" class="swal2-input" placeholder="Password">`,
                        confirmButtonText: 'Sign in',
                        focusConfirm: false,
                        preConfirm: () => {
                            const login = swal.getPopup().querySelector('#login').value
                            const password = swal.getPopup().querySelector('#password').value
                            if (!login || !password) {
                            swal.showValidationMessage(`Please enter login and password`)
                            }
                            return { login: login, password: password }
                        }
                    })
                }

                if(result.isConfirmed == true){
                    const databody = {
                        username: result.value.login,
                        password: result.value.password
                    } 
                    let response = await utils.callApi(databody, "/user/login", 'post')
                    if(response.user_id){
                        databody["user_id"]=localStorage.getItem("user_id")
                        let usersList = await utils.callApi(databody, '/user/list', 'post')
                        console.log(typeof usersList)
                        if((typeof usersList)=='object'){
                            if(usersList.length > 0){  
                                this.calendarSettings = false
                                this.userSettings = false
                                this.adminList = true
                            }
                        }
                    }
                }
            },
            async changePassword(){
                //rotta esclusiva per cambio password
                if(!this.flagChangePassword){
                    this.flagChangePassword = true
                } else {
                    let databody={
                        username: user.username,
                        user_id: localStorage.getItem("user_id"),
                        password: this.oldPass,
                        newPassword: this.newPass
                    };
                    await utils.callApi(databody, '/user/modify/password', 'post')
                    this.oldPass = ref('')
                    this.newPass = ref('')
                    this.flagChangePassword = false
                }
            },
            async modifyUser(){
                let databody={};
                if(this.calendarSettings){
                    databody = {
                        notification: this.notification==user.notification?'':this.notification,
                        graph_setting: this.graph_setting==user.graph_setting?'':this.graph_setting
                    }
                } else {
                    databody = {
                        username: this.username==user.username?'':this.username,
                        mail: this.mail==user.mail?'':this.mail
                    }
                }
                databody["user_id"]=localStorage.getItem("user_id");
                const response = await utils.callApi(databody, '/user/modify', 'post');
                user = response.user
                this.setInput()
                this.modify = false;
            }
        },
        data(){
            return{
                username: null,
                oldPass: null, 
                newPass: null,
                flagChangePassword: false,
                mail: null, 
                notification: null, 
                graph_setting: null,
                userSettings: true,
                calendarSettings: false,
                adminList: false,
                modify: false
            }
        },
    })
</script>


<template>
    <div class="container">
        <div class="menuSettings">
            <div ref="userTab" class="user" v-bind:class="{ active: userSettings }" @click="switchMenuSettings(false, $event)">
                <span>Utente</span>
            </div>
            <div ref="calendarTab" class="calendar" v-bind:class="{ active: calendarSettings }" @click="switchMenuSettings(true, $event)">
                <span>Calendar</span>
            </div>
            <div ref="adminTab" class="admin" v-bind:class="{ active: adminList }" @click="switchAdminList()">
                <span>Admin</span>
            </div>
        </div>
        <div class="settings">
            <div class="underButton linkButton">
              <button class="miniButton" type="button" @click="modify = !modify"><i class="fa-xs fa-solid fa-pencil "></i></button>
            </div>
            <div v-if="modify" class="underButton submitButton">
              <button class="miniButton" type="button" @click="modifyUser()"><i class="fa-xs fa-solid fa-floppy-disk"></i></button>
            </div>
            <div class="userSettings" v-if="userSettings">
            <!-- <form @submit.prevent="submitForm"> -->
                <div class="row">
                    <label for="username">Username</label>
                    <input :disabled="!modify" type="username" id="username" v-model="username" required>
                </div>
                <div class="row">
                    <label for="mail">Email</label>
                    <input :disabled="!modify" type="mail" id="mail" v-model="mail" required>
                </div>
                <div class="row" v-if="flagChangePassword">
                    <label for="password">Vecchia Password:</label>
                    <input type="password" id="password" v-model="oldPass" required>
                </div>
                <div class="row" v-if="flagChangePassword">
                    <label for="password">Nuova Password:</label>
                    <input type="password" id="password" v-model="newPass" required>
                </div>
                <button type="button" @click="changePassword()">Cambia Password</button>
            <!-- </form> -->
            </div>
            <div class="calendarSetting" v-if="calendarSettings">
                <!-- <form @submit.prevent="submitForm"> -->
                    <div class="row">
                        <label for="notification">Notifiche:</label>
                        <input :disabled="!modify" type="checkbox" id="notification" v-model="notification" required>
                    </div>
                    <div class="row">
                        <label for="graph_setting">Grafico:</label>
                        <select :disabled="!modify" v-model="graph_setting"
                                id="graph_setting">
                            <option value="hours">
                                Ore
                            </option>
                            <option value="minutes">
                                Minuti
                            </option>
                            <option value="seconds">
                                Secondi
                            </option>
                        </select>
                    </div>
                <!-- </form> -->
            </div>
            <div class="adminList" v-if="adminList">
                <form>
                    <div class="row">
                        <label for="notification">Hello:</label>
                        <input :disabled="!modify" type="checkbox" id="notification" v-model="notification" required>
                    </div>
                    <div class="row">
                        <label for="graph_setting">Grafico:</label>
                        <select :disabled="!modify" v-model="graph_setting"
                                id="graph_setting">
                            <option value="hours">
                                Ore
                            </option>
                            <option value="minutes">
                                Minuti
                            </option>
                            <option value="seconds">
                                Secondi
                            </option>
                        </select>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
</template>

<style lang="scss">
    @import '../assets/style/userRouteStyle.scss'; 
</style>