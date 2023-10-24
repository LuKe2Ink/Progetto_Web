<script>
    import { defineComponent, ref } from 'vue';
    import axios from 'axios';
    import router from '../router/router';
    import swal from 'sweetalert2';
    import config from '../../configApi.json';
    import tokenVerify from '../function/tokenSave';

    await tokenVerify.verifyAndSaveToken();

    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
        .replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, 
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    async function typeList(){
        const databody = {
            user_id: localStorage.getItem('user_id'),
            special: true
        }
        const response = await axios.post(config.apiAddress+':'+config.apiPort+'/types/list/filtered', 
            databody, {headers: { 'Authorization': 'Bearer '+localStorage.getItem('token')}}
        );
        const data = response.data;
        if(data.status == 'ko'){
            await swal({
                title: "Error",
                text: data.message,
                icon: "error",
                className: "sweetAlert"
            })
        }
        return data
    }

    async function objectList(){
            const databody = {
            user_id: localStorage.getItem('user_id')
        }
        const response = await axios.post(config.apiAddress+':'+config.apiPort+'/object/list', 
            databody, {headers: { 'Authorization': 'Bearer '+localStorage.getItem('token')}}
        );
        const data = response.data;
        if(data.status == 'ko'){
            await swal({
                title: "Error",
                text: data.message,
                icon: "error",
                className: "sweetAlert"
            })
        }
        return data.data;
    }

    const objectsList = await objectList();
    objectsList.map((element)=>{
        element.guidInput = uuidv4()
        element.guidLabel = uuidv4()
        return element;
    })
    let eventTypes = await typeList();


    export default defineComponent({
        created(){
            let jsonOptions = [];
            eventTypes.forEach(element => {
                jsonOptions.push({
                    text: element.name, value: element._id
                })
            });
            this.options = ref(jsonOptions)
        },
        data(){
            return{
                img: '',
                file: '',
                objectsList: objectsList,
                name: ref(''),
                prevSave: '',
                prevName: '',
                prevImg: '',
                imgIdClicked: '',
                options: '',
                nomeAdd: ref(''),
                tipoAdd: ref(''),
                show: false,
                srcOriginal: ''
            }
        },
        methods: {
            onFileChange(e) {
                var files = e.target.files || e.dataTransfer.files;
                if (!files.length)
                    return;
                this.createImage(files[0]);
            },
            createImage(file) {
                var image = new Image();
                var reader = new FileReader();

                reader.onload = (e) => {
                    var image = new Image();
                    image.src = e.target.result;
                    console.log(image.width, image.height)
                    if(image.width == image.height){
                        if(this.$refs.imgFormInput["inputFormImg"]){
                            this.$refs.imgFormInput.src = e.target.result;
                        } else {
                            this.img = e.target.result;
                            if(this.imgIdClicked != ''){
                                let predicate = (element) => element._id == this.imgIdClicked;
                                let index = this.objectsList.findIndex(predicate)
                                this.prevImg = this.objectsList[index].img
                                this.objectsList[index].img = this.img
                            }
                        }
                    }
                    else {
                        swal({
                            title: "Error",
                            text: "Immagine non validata, l'altezza e la larghezza devono essre uguali",
                            icon: "error",
                            className: "sweetAlert"
                        })
                        this.img = ''
                    }
                };
                reader.readAsDataURL(file);
            },
            async modifySave(id){
                let predicate = (element) => element._id == this.prevSave;
                let index = this.objectsList.findIndex(predicate)
                const databody = {
                    object_id: id,
                    img: this.img ? this.img : this.prevImg,
                    name: this.name,
                    event_type_id: this.objectsList[index].event_type
                }
                await tokenVerify.verifyAndSaveToken();
                const response = await axios.post(config.apiAddress+':'+config.apiPort+'/object/modify', databody, 
                    {headers: {Authorization: 'Bearer '+localStorage.getItem('token')} }
                );
                let data = response.data
                
                if(data.status == 'ko'){
                    await swal({
                        title: "Error",
                        text: data.message,
                        icon: "error",
                        className: "sweetAlert"
                    })
                } else {
                    this.objectsList[index].img = this.img ? this.img : this.prevImg
                    this.$refs[this.prevSave][0].hidden = true;
                    if(this.$refs[this.prevName] && this.$refs[this.prevName] !=''){
                        this.$refs[this.prevName.show][0].hidden = false;
                        this.$refs[this.prevName.hide][0].hidden = true;
                    }
                }
            },
            async deletObject(id){
                const resultSwal = await swal({
                    title: "Attenzione",
                    text: "Si vuole anche eliminare tutti gli eventi collegati all'oggetto?",
                    icon: "warning",
                    buttons: {
                        cancel: "Annulla",
                        confirm: {
                            text: "Conferma",
                            value: true,
                        }
                    }
                })
                const databody = {
                    object_id: id,
                    chain_events: resultSwal
                }
                await tokenVerify.verifyAndSaveToken();
                const response = await axios.post(config.apiAddress+':'+config.apiPort+'/object/delete', databody, 
                    {headers: {Authorization: 'Bearer '+localStorage.getItem('token')} }
                );
                if(response.data.status == 'ko'){
                    await swal({
                        title: "Error",
                        text: data.message,
                        icon: "error",
                        className: "sweetAlert"
                    })
                } else {
                    let predicate = (element) => element._id == response.data.object;
                    let index = this.objectsList.findIndex(predicate)
                    this.objectsList.splice(index, 1)
                    await swal({
                        title: "Successo",
                        text: "L'oggetto è stato eliminato con successo",
                        icon: "success"
                    }) 
                    
                }

            },
            showInput(save, show, hide, name){
                if(this.prevSave != save && this.prevSave != ''){
                    this.$refs[this.prevSave][0].hidden = true;
                    this.$refs[this.prevName.show][0].hidden = false;
                    this.$refs[this.prevName.hide][0].hidden = true;
                }

                this.prevSave = save
                this.$refs[this.prevSave][0].hidden = false;
                this.prevName = {
                    hide: show,
                    show: hide
                }
                this.$refs[show][0].hidden = false;
                this.$refs[hide][0].hidden = true;
                this.name=name
            },
            triggerInputImg(input, id, name){
                console.log(input)
                if(input){
                    this.$refs.imgFormInput["inputFormImg"]=true
                } else {
                    this.$refs.imgFormInput["inputFormImg"]=false
                    this.name = name;
                    if(this.prevSave != id && this.prevSave != ''){
                        this.$refs[this.prevSave][0].hidden = true;
                        this.img = '';
                        this.imgIdClicked = ''
                        this.$refs.imgInput.value = ''
                        let predicate = (element) => element._id == this.prevSave;
                        let index = this.objectsList.findIndex(predicate)
                        this.objectsList[index].img = this.prevImg
                    }

                    this.prevSave = id
                    this.$refs[this.prevSave][0].hidden = false;
                    this.imgIdClicked = id
                }

                this.$refs.imgInput.click()
            },
            addCard(){
                this.resetForm()
                this.srcOriginal = this.$refs.imgFormInput.src
                let newObject = this.$refs["formNewObject"]
                console.log(newObject)
                newObject.hidden = false
                this.$refs["objectListForm"].append(newObject)
            },
            async addSave(){
                if(this.$refs.imgFormInput.src == this.srcOriginal ){
                    await swal({
                        title: "Errore",
                        text: "Inserire un'immagine",
                        icon: "error",
                        className: "sweetAlert"
                    })
                }
                const databody = {
                    img: this.$refs.imgFormInput.src,
                    name: this.nomeAdd,
                    event_type_id: this.tipoAdd,
                    user_id: localStorage.getItem('user_id'),
                }  
                await tokenVerify.verifyAndSaveToken();
                const response = await axios.put(config.apiAddress+':'+config.apiPort+'/object/add', databody, 
                    {headers: {Authorization: 'Bearer '+localStorage.getItem('token')} }
                );
                let data = response.data
                
                if(data.status == 'ko'){
                    await swal({
                        title: "Error",
                        text: data.message,
                        icon: "error",
                        className: "sweetAlert"
                    })
                } else {
                    this.resetForm()
                }
            },
            resetForm(){
                this.$refs.imgInput.src = "../assets/images.png";
                this.nomeAdd = ref('');
                this.tipoAdd = ref('');
                this.$refs.formNewObject.hidden = true;
            }

        },
    })
</script>


<template>
    <div class="contenitore">
        <div class="specialObjects">
            <div class="objectList" :ref="'objectListForm'">
                <div v-for="object in objectsList" class="singleObject">
                    <div class="objectName">
                        <div hidden="true" :ref="object.guidInput">
                            <input v-model="name" class="inputTitle" type="text" required="required">
                            <span class="highlight"></span>
                            <span class="bar"></span>
                            <label>Titolo</label>
                        </div>
                        <span :ref="object.guidLabel" @click="showInput(object._id, object.guidInput, object.guidLabel, object.name)">
                            {{ object.name }}
                        </span>
                    </div>
                    <div class="objectBody">
                        <img v-bind:src="object.img" class="objectImage" @click="triggerInputImg(false, object._id, object.name)" />
                    </div>
                    <button class="deleteObject" @click="deletObject(object._id)">
                        <i class="fa-solid fa-trash-can fa-xl"></i>
                    </button>
                    <button hidden="true" class="saveModify" :ref="object._id" @click="modifySave(object._id)">
                        <i class="fa-solid fa-floppy-disk fa-xl"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div hidden="true">
        <input :ref="'imgInput'" v-on:change="onFileChange" type="file"/>
    </div>
    <button class="addObject" @click = "addCard()"><i class="fa-solid fa-add fa-2xl"></i></button>
    <!-- form per aggiunta di nuovi oggetti -->
    <div hidden="true" class="singleObject" :ref="'formNewObject'">
        <form @submit.prevent="addSave()">
            <div class="objectName">
                <div>
                    <input v-model="nomeAdd" class="inputTitle" type="text" required="required">
                    <span class="highlight"></span>
                    <span class="bar"></span>
                    <label>Titolo</label>
                </div>
            </div>
            <div  class="objectBody">
                <img @drop="triggerInputImg(true)" :ref="'imgFormInput'" src="/images/images.png" class="objectImage" @click="triggerInputImg(true)" />
            </div>
            <div class="typesInput">
                <select v-model="tipoAdd" required>
                    <option v-for="option in options" :value="option.value">
                    {{ option.text }}
                    </option>
                </select>
            </div>
            <button class="deleteObject" @click="resetForm()">
                <i class="fa-solid fa-trash-can fa-xl"></i>
            </button>
            <button type="submit" class="saveModify">
                <i class="fa-solid fa-floppy-disk fa-xl"></i>
            </button>
        </form>
    </div>
</template>

<style lang="scss" scooped>
    @import '../assets/style/specialObjectStyle.scss'; 
</style>