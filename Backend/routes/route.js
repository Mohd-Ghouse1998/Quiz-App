const express=require('express')
const router=express.Router()
let createUser=require('../controllers/createUser')
let createRoom=require('../controllers/createRoom')
let gameplayController=require('../controllers/gameplayController')

router.post('/createUser',createUser.createUser)
router.post('/login',createUser.login)
router.get('/user/:userId',createUser.getUser)

router.post('/create-room',createRoom.createRoom)
router.get('/get-room',createRoom.getRooms)
router.get('/get-room/:roomId',createRoom.getRoomById)
router.post('/join-room/:roomId/:userId',createRoom.enterRoom)
router.post('/get-questions', gameplayController.sampleQuestions1);
router.post('/start-game/:roomId/:userId', gameplayController.handleGameplay);
router.post('/answer-question/:roomId/:userId', gameplayController.answerQuestion);

module.exports=router