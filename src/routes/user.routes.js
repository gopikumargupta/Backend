import { Router } from "express";
import { loginUser,
       logoutUser,
       registerUser,
       refreshaccestoken,
       changeCurrentPassword,
       CurentUser,
       updateAccountDetails,
       updateUserAvtar,
       updateUsercover,
       getUserChannelProfie,
       getWatchHistory } from "../controllers/user.controllers.js";
import {upload} from '../middlewares/multer.middleware.js'
import {verifyJWT} from'../middlewares/auth.middleware.js'

const router=Router()


router.route('/register').post(
    upload.fields([
        {
            name:'avtar',
            maxCount:1
        },{
            name:'coverImage',
            maxCount:1
        }
    ]),
    registerUser
)
router.route('/login').post(loginUser)
// secure routes
router.route('/logout').post(verifyJWT,logoutUser)
router.route('refresh-token').post(refreshaccestoken)
router.route('/change-password').post(verifyJWT,changeCurrentPassword)
router.route('/curren-tuser').get(verifyJWT,CurentUser)
router.route('/update-accounts-details').patch(verifyJWT,updateAccountDetails)
router.route('/avtar').patch(verifyJWT,upload.single('avtar'),updateUserAvtar)
router.route('/cover').patch(verifyJWT,upload.single("coverImage"),updateUsercover)
router.route('/c/:username').get(verifyJWT,getUserChannelProfie)
router.route('/watchhistory').get(verifyJWT,getWatchHistory)
export default router;
