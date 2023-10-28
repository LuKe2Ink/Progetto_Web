<script>
    import { defineComponent, ref, toRaw  } from 'vue';
    import axios from 'axios';
    import router from '../router/router';
    import swal from 'sweetalert2';
    import config from '../../configApi.json';
    import { layouts } from 'chart.js';
    import utils from '../function/utils';
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
            user_id: localStorage.getItem('user_id')
        }
        const response = await utils.callApi(databody, '/types/list', "post")
        if(response.status == 'ko' || response == 'ko'){
            localStorage.setItem('user_id', null)
            localStorage.setItem('token', null)
            await router.push("/login")
            return null
        }
        return response
    }

    let eventTypes = await typeList();
    eventTypes.map((element)=>{
        element.guidLabel = uuidv4()
        element.guidColor = uuidv4()
        element.guidGraph = uuidv4()
        return element;
    })


    export default defineComponent({
        data(){
            return{
                img: '',
                file: '',
                prev: {},
                eventTypes: eventTypes,
                name: ref(''),
                color: ref(''),
                graph: ref(''), 
                nameInput: ref(''),
                colorInput: ref(''),
                graphInput: false,
            }
        },
        methods: {
            async modifySave(id){
                let swalResponse = await swal.fire({
                    title: 'Sei sicuro di voler modificare questa etichetta?',
                    showDenyButton: true,
                    showCancelButton: false,
                    confirmButtonText: 'Si',
                    denyButtonText: 'No'
                })
                if(swalResponse.isConfirmed){
                    let predicate = (element) => element._id == this.prev.save;
                    let index = this.eventTypes.findIndex(predicate)
                    const databody = {
                        type_id: id,
                        name: this.name,
                        color: this.color,
                        tipology: this.prev.type.tipology,
                        graph: this.graph
                    }
                    await tokenVerify.verifyAndSaveToken();
                    const response = await utils.callApi(databody, '/types/modify', "post")
                    if(response.status == 'ko' || response == 'ko'){
                        localStorage.setItem('user_id', null)
                        localStorage.setItem('token', null)
                        await router.push("/login")
                        return null
                    } else {
                        this.eventTypes[index] = response
                        this.eventTypes[index].guidLabel = uuidv4()
                        this.eventTypes[index].guidColor = uuidv4()
                        this.eventTypes[index].guidGraph = uuidv4()
                        this.prev.type = this.eventTypes[index]
                        this.$refs[this.prev.save][0].hidden = true;
                    }
                }
            },
            async deleteObject(id){
                let swalResponse = await swal.fire({
                    title: 'Sei sicuro di voler eliminare questa etichetta?',
                    showDenyButton: true,
                    showCancelButton: false,
                    confirmButtonText: 'Si',
                    denyButtonText: 'No'
                })
                if(swalResponse.isConfirmed){
                    const resultSwal = await swal.fire({
                        title: "Attenzione",
                        text: "Procedendo verranno eliminati anche tutti gli eventi collegati all'etichetta e se presenti anche tutti gli oggetti collegati, si vuole comunque procedere?",
                        icon: "warning",
                        showDenyButton: true,
                        showCancelButton: false,
                        confirmButtonText: 'Si',
                        denyButtonText: 'No'
                    })
                    if(resultSwal.isConfirmed){
                        const databody = {
                            type_id: id,
                            chain_events: true,
                        }
                        await tokenVerify.verifyAndSaveToken();
                        const response = await utils.callApi(databody, '/types/delete', "post")
                        if(response.status == 'ko' || response == 'ko'){
                            localStorage.setItem('user_id', null)
                            localStorage.setItem('token', null)
                            await router.push("/login")
                            return null
                        } else {
                            let predicate = (element) => element._id == response._id;
                            let index = this.eventTypes.findIndex(predicate)
                            this.eventTypes.splice(index, 1)
                            await swal.fire({
                                title: "Successo",
                                text: "L'oggetto è stato eliminato con successo",
                                icon: "success"
                            }) 
                        }
                    }
                }
            },
            showInput(show, hide, save, type){
                if(!type.defaults){
                    if(this.prev.save != undefined && this.prev.save != save){
                        this.setModifyForm(type)
                        this.$refs[this.prev.save][0].hidden = true;
                        
                        this.hideModify(this.prev.type)
                    } else if(this.prev.save == undefined){
                        this.setModifyForm(type)
                    }

                    this.prev = {
                        save: save,
                        type: type 
                    }
                    this.$refs[save][0].hidden = false;
                    this.$refs[show][0].hidden = false;
                    this.$refs[hide][0].hidden = true;
                }
            },
            hideModify(type){
                
                
                this.$refs[type._id+type.guidLabel][0].hidden = false;
                this.$refs[type._id+type.guidColor][0].hidden = false;
                this.$refs[type._id+type.guidGraph][0].hidden = false;
              //input
                this.$refs[type.guidLabel][0].hidden = true;
                this.$refs[type.guidColor][0].hidden = true;
                this.$refs[type.guidGraph][0].hidden = true;
            },
            setModifyForm(type){
                this.name = type.name
                this.color = type.color
                this.graph = type.graph
            },
            addCard(){
                this.resetForm()
                let newObject = this.$refs["formNewType"]
                newObject.hidden = false
                this.$refs["typeListForm"].append(newObject)
            },
            async addSave(){
                const databody = {
                    name: this.nameInput,
                    color: this.colorInput==''?'#000000':this.colorInput,
                    graph: this.graphInput==''?false:this.graphInput,
                    user_id: localStorage.getItem('user_id'),
                }
                
                await tokenVerify.verifyAndSaveToken();
                const response = await utils.callApi(databody, '/types/create', "put")
                if(response.status == 'ko' || response == 'ko'){
                    localStorage.setItem('user_id', null)
                    localStorage.setItem('token', null)
                    await router.push("/login")
                    return null
                } else {
                    this.eventTypes.push(response)
                    let last = this.eventTypes.length-1
                    this.eventTypes[last]["guidLabel"] = uuidv4()
                    this.eventTypes[last]["guidColor"] = uuidv4()
                    this.eventTypes[last]["guidGraph"] = uuidv4()
                    this.resetForm()
                }
            },
            resetForm(){
                this.nameInput = ref('');
                this.colorInput = ref('');
                this.graphInput = ref('')
                this.$refs.formNewType.hidden = true;
            }

        },
    })
</script>

<template>
    <div class="contenitore">
        <div class="specialObjects">
            <div class="objectList" :ref="'typeListForm'">
                <div v-for="_type in eventTypes" class="singleObject" v-bind:style="{ borderColor: _type.color }" :key="_type">
                    <div :key="_type">
                        <div :key="_type.name" class="objectName textInputOnly">
                            <div hidden="true" :ref="_type.guidLabel">
                                <input v-model="name" class="inputTitle" type="text" required="required">
                                <span class="highlight"></span>
                                <span class="bar"></span>
                                <label>Titolo</label>
                            </div>
                            <span :ref="_type._id+_type.guidLabel" @click="showInput(_type.guidLabel, _type._id+_type.guidLabel, _type._id, _type)">
                                {{ _type.name }}
                            </span>
                        </div>
                        <div :key="_type" class="objectBody">
                            <div  hidden="true" :ref="_type.guidColor" class="colorInput spaceBottom">
                                <p>Colore:
                                    <input v-model="color" type="color">
                                </p> 
                            </div>
                            <p :ref="_type._id+_type.guidColor" @click="showInput(_type.guidColor, _type._id+_type.guidColor, _type._id, _type)">
                                Colore: <span v-bind:style="{ color: _type.color }">{{ _type.color }}</span>
                            </p>
                            <div  hidden="true" :ref="_type.guidGraph" class="radioInput">
                                <label for="graph">Grafico:</label>
                                <input type="checkbox" name="graph" v-model="graph">
                            </div>
                            <p :ref="_type._id+_type.guidGraph" @click="showInput(_type.guidGraph, _type._id+_type.guidGraph, _type._id, _type)">
                                Grafico: {{ _type.graph ? "Si" : "No" }}
                            </p>
                        </div>
                    </div>
                    <div class="buttonInputOnly">
                        <button v-if="!_type.defaults" class="deleteObject" @click="deleteObject(_type._id)">
                        <i class="fa-solid fa-trash-can fa-xl"></i>
                        </button>
                        <button hidden="true" class="saveModify" :ref="_type._id" @click="modifySave(_type._id)">
                            <i class="fa-solid fa-floppy-disk fa-xl"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <button class="addObject" @click = "addCard()"><i class="fa-solid fa-add fa-2xl"></i></button>
    <div hidden="true" class="singleObject" :ref="'formNewType'">
        <form @submit.prevent="addSave()">
            <div class="objectName textInputOnly">
                <input v-model="nameInput" class="inputTitle" type="text" required="required">
                <span class="highlight"></span>
                <span class="bar"></span>
                <label>Titolo</label>
            </div>
            <div class="objectBody">
                <div class="colorInput spaceBottom">
                    <p>Colore:
                        <input v-model="colorInput" type="color">
                    </p> 
                </div>
                <div class="radioInput">
                    <label for="graph">Grafico:</label>
                    <input type="checkbox" name="graph" v-model="graphInput">
                </div>
            </div>
            <div class="buttonInputOnly">
                <button class="deleteObject" @click="resetForm()">
                    <i class="fa-solid fa-trash-can fa-xl"></i>
                </button>
                <button type="submit" class="saveModify">
                    <i class="fa-solid fa-floppy-disk fa-xl"></i>
                </button>
            </div>
        </form>
    </div>
</template>

<style lang="scss" scooped>
    @import '../assets/style/typeStyle.scss'; 
</style>