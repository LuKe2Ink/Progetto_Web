<script>
    import { defineComponent, ref } from 'vue';
    import axios from 'axios';
    import router from '../router/router';
    import swal from 'sweetalert2';
    import config from '../../configApi.json';
    import tokenVerify from '../function/tokenSave';
    import utils from '../function/utils';

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
        const response = await utils.callApi(databody, '/types/list/filtered', "post")
        if(response.status == 'ko' || response == 'ko'){
            localStorage.setItem('user_id', null)
            localStorage.setItem('token', null)
            await router.push("/login")
            return null
        }
        return response
    }

    async function objectList(){
            const databody = {
            user_id: localStorage.getItem('user_id')
        }
        const response = await utils.callApi(databody, '/object/list', "post")
        if(response.status == 'ko' || response == 'ko'){
            localStorage.setItem('user_id', null)
            localStorage.setItem('token', null)
            await router.push("/login")
            return null
        }
        return response;
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
                objectImg: '',
                imgIdClicked: '',
                options: '',
                nomeAdd: ref(''),
                tipoAdd: ref(''),
                show: false,
                srcOriginal: ''
            }
        },
        methods: {
            dragover(e) {
                e.preventDefault();
                this.isDragging = true;
            },
            dragleave() {
                this.isDragging = false;
            },
            drop(e) {
                e.preventDefault();
                console.log("hello there")
                this.onFileChange(e);
                this.isDragging = false;
            },
            onFileChange(e) {
                console.log("entra")
                var files = e.target.files || e.dataTransfer.files;
                if (!files.length)
                    return;
                this.createImage(files[0]);
            },
            async createImage(file) {
                let sizeMB = file.size/(1024*1024)
                if(sizeMB>15){
                    await swal.fire({
                        title:"La grandezza del file supera i 15 MB",
                        icon:'error'
                    })
                    this.$refs.fileInput.value = ''
                } else {
                    var image = new Image();
                    var reader = new FileReader();

                    reader.onload = (e) => {
                        var image = new Image();
                        image.src = e.target.result;
                        if(this.$refs.imgFormInput["inputFormImg"]){
                            this.$refs.imgFormInput.src = e.target.result;
                        } else {
                            this.img = e.target.result;
                            if(this.imgIdClicked != ''){
                                let predicate = (element) => element._id == this.imgIdClicked;
                                let index = this.objectsList.findIndex(predicate)
                                console.log(this.imgIdClicked, this.prevSave)
                                if(this.prevImg == '')
                                    this.prevImg = this.objectsList[index].img
                                this.objectsList[index].img = this.img
                            }
                        }
                    };
                }
                reader.readAsDataURL(file);
            },
            async modifySave(id){
                let swalResponse = await swal.fire({
                    title: 'Sei sicuro di voler modificare questo oggetto?',
                    showDenyButton: true,
                    showCancelButton: false,
                    confirmButtonText: 'Si',
                    denyButtonText: 'No'
                })
                if(swalResponse.isConfirmed){
                    let predicate = (element) => element._id == this.prevSave;
                    let index = this.objectsList.findIndex(predicate)
                    const databody = {
                        object_id: id,
                        img: this.img ? this.img : this.prevImg,
                        name: this.name,
                        event_type_id: this.objectsList[index].event_type
                    }
                    await tokenVerify.verifyAndSaveToken();
                    const response = await utils.callApi(databody, '/object/modify', "post")
                    if(response.status == 'ko' || response == 'ko'){
                        localStorage.setItem('user_id', null)
                        localStorage.setItem('token', null)
                        await router.push("/login")
                        return null
                    } else {
                        this.$refs[this.objectsList[index].guidInput].hidden = true;
                        this.$refs[this.objectsList[index].guidLabel].hidden = false;
                        if(!this.img && this.img!=''){
                            this.objectsList[index].img = this.img
                            this.prevImg = this.img
                        }
                        if(!this.prevImg && this.prevImg != ''){
                            this.objectsList[index].img = this.prevImg
                        }

                        this.$refs[this.prevSave][0].hidden = true;
                        if(this.prevName != ''){
                            this.$refs[this.prevName.show][0].hidden = false;
                            this.objectsList[index].name = this.name
                            this.$refs[this.prevName.hide][0].hidden = true;
                        }
                        this.prevSave = '';
                        this.prevImg = '';
                        this.prevName = '';

                        if(this.$refs[this.prevName] && this.$refs[this.prevName] !=''){
                            this.$refs[this.prevSave][0].hidden = true;
                            this.$refs[this.prevName.show][0].hidden = false;
                            this.$refs[this.prevName.hide][0].hidden = true;
                        }
                    }
                }
            },
            async deletObject(id){
                let swalResponse = await swal.fire({
                    title: 'Sei sicuro di voler eliminare questo oggetto?',
                    showDenyButton: true,
                    showCancelButton: false,
                    confirmButtonText: 'Si',
                    denyButtonText: 'No'
                })
                if(swalResponse.isConfirmed){
                    const resultSwal = await swal.fire({
                        title: "Attenzione",
                        text: "Procedendo verranno eliminati anche tutti gli eventi collegati all'oggetto, si vuole comunque procedere?",
                        icon: "warning",
                        showDenyButton: true,
                        showCancelButton: false,
                        confirmButtonText: 'Si',
                        denyButtonText: 'No'
                    })
                    if(resultSwal.isConfirmed){
                        const databody = {
                            object_id: id,
                            chain_events: true
                        }
                        await tokenVerify.verifyAndSaveToken();
                        const response = await utils.callApi(databody, '/object/delete', "post")
                        if(response.status == 'ko' || response == 'ko'){
                            localStorage.setItem('user_id', null)
                            localStorage.setItem('token', null)
                            await router.push("/login")
                            return null
                        } else {
                            let predicate = (element) => element._id == response;
                            let index = this.objectsList.findIndex(predicate)
                            this.objectsList.splice(index, 1)
                            this.prevImg = ''
                            this.prevName = ''
                            this.prevSave = ''
                        }
                    }
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
            triggerInputImg(input, id, name, click = true){
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
                        if(this.prevImg!='')
                            this.objectsList[index].img = this.prevImg
                        this.prevImg = ''
                    }

                    this.prevSave = id
                    this.$refs[this.prevSave][0].hidden = false;
                    this.imgIdClicked = id
                }

                if(click)
                    this.$refs.imgInput.click()
            },
            addCard(){
                if(this.prevImg != ''){
                    this.$refs[this.prevSave][0].hidden = true;
                    this.img = '';
                    this.imgIdClicked = ''
                    this.$refs.imgInput.value = ''
                    let predicate = (element) => element._id == this.prevSave;
                    let index = this.objectsList.findIndex(predicate)
                    this.objectsList[index].img = this.prevImg
                }
                this.resetForm()
                this.srcOriginal = this.$refs.imgFormInput.src
                let newObject = this.$refs["formNewObject"]
                newObject.hidden = false
                this.$refs["objectListForm"].append(newObject)
            },
            async addSave(){
                if(this.$refs.imgFormInput.src == this.srcOriginal ){
                    await swal.fire({
                        title: "Errore",
                        text: "Inserire un'immagine",
                        icon: "error",
                        className: "sweetAlert"
                    })
                } else {
                    const databody = {
                        img: this.$refs.imgFormInput.src,
                        name: this.nomeAdd,
                        event_type_id: this.tipoAdd,
                        user_id: localStorage.getItem('user_id'),
                    }  
                    await tokenVerify.verifyAndSaveToken();
                    const response = await utils.callApi(databody, '/object/add', "put")
                    if(response.status == 'ko' || response == 'ko'){
                        localStorage.setItem('user_id', null)
                        localStorage.setItem('token', null)
                        await router.push("/login")
                        return null
                    } else {
                        response.guidInput = uuidv4()
                        response.guidLabel = uuidv4()
                        objectsList.push(response)
                        this.img = ''
                        this.resetForm()
                    }
                }
            },
            resetForm(){
                this.$refs.imgInput.src = "../assets/images.png";
                this.$refs.imgFormInput.src = "/images/images.png"
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
            <div class="objectList" :ref="'objectListForm'" :key="objectsList">
                <div v-for="object in objectsList" class="singleObject" v-bind:style="{ borderColor: object.type.color }">
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
                    <div class="objectBody" 
                        @dragover="dragover"
                        @dragleave="dragleave"
                        @drop="(e)=>{triggerInputImg(false, object._id, object.name, false); drop(e)}">
                        <img v-bind:src="object.img" class="objectImage" :title="object.type.name"
                            @click="triggerInputImg(false, object._id, object.name)" />
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
        <input accept="image/*,image/jpeg" :ref="'imgInput'" v-on:change="onFileChange" type="file"/>
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
            <div class="objectBody"
                @dragover="dragover"
                @dragleave="dragleave"
                @drop="(e)=>{triggerInputImg(true, null, null, false); drop(e)}">
                <img accept="image/*,image/jpeg" @drop="triggerInputImg(true)" 
                    :ref="'imgFormInput'" src="/images/images.png" class="objectImage" 
                    @click="triggerInputImg(true)" />
            </div>
            <div class="typeBackground">
                <div class="typesInput">
                    <select v-model="tipoAdd" required>
                        <option v-for="option in options" :value="option.value">
                        {{ option.text }}
                        </option>
                    </select>
                </div>
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