const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const tagModel = require("../Models/tagModel");
const userModel = require("../Models/userModel");
const profileModel = require("../Models/profile");
const wicketModel = require("../Models/wicketModel");
const battingModel = require("../Models/battingModel");
const bowlingModel = require("../Models/bowlingModel");
const bow_batModel = require("../Models/bow_batModel");
const routineModel = require("../Models/routineModel");
const myDrillModel = require("../Models/myDrillModel");
const categoryModel = require("../Models/categoryModel");
const academyProfile = require("../Models/academyProfile");
const powerTestModel = require("../Models/power_testModel");
const assignedByModel = require("../Models/assignedByModel");
const readinessSurveyModel = require("../Models/readinessSurvey");
const strengthTestModel = require("../Models/strength_testModel");
const academy_coachModel = require('../Models/academy_coachModel');
const recommendationModel = require("../Models/recommendationModel");
const scoreAndremarkModel = require("../Models/scoreAndremarkModel");
// const coachRoutineModel = require("../Models/coachRoutineModel");


//==========================[user register]==============================
const createUser = async function (req, res) {
    try {
        let data = req.body;
        let { name, phone, join_as, signup_as, email, password, academy_name, academy_id, coach_id } = data

        if (await userModel.findOne({ phone: phone }))
            return res.status(400).send({ message: "Phone already exist" })

        if (await userModel.findOne({ email: email }))
            return res.status(400).send({ message: "Email already exist" })

        const encryptedPassword = bcrypt.hashSync(password, 12)
        req.body['password'] = encryptedPassword;

        var token = jwt.sign({
            userId: userModel._id,
        }, "project");
        data.token = token;

        let savedData = await userModel.create(data);
        res.status(201).send({
            status: true,
            msg: "User Register successfull",
            data: {
                _id: savedData._id,
                name: savedData.name,
                phone: savedData.phone,
                join_as: savedData.join_as,
                email: savedData.email,
                password: savedData.password,
                signup_as: savedData.signup_as,
                academy_id: savedData.academy_id
            }
        })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
};

//==========================[user login]==============================
const userLogin = async function (req, res) {
    try {
        let data = req.body;
        let { email, password } = data;

        let user = await userModel.findOne({ email: email })

        if (!user) {
            return res.status(400).send({
                status: false,
                msg: "Email and Password is Invalid"
            })
        };

        let compared = await bcrypt.compare(password, user.password)
        if (!compared) {
            return res.status(400).send({
                status: false,
                message: "Your password is invalid"
            })
        };

        let UserProfile = await profileModel.findOne({ userId: user._id }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
        let type = UserProfile ? "Yes" : "No";
        user.user_details_submit = type;

        var token = jwt.sign({
            userId: user._id,
        }, "project");

        let updateToken = await userModel.findByIdAndUpdate({ _id: user._id }, { token }, { new: true });
        user.token = updateToken.token;

        let progress = await battingModel.findOne({ userId: user._id }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
        let type1 = progress ? true : false;

        let progress2 = await bowlingModel.findOne({ userId: user._id }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
        let type2 = progress2 ? true : false;

        let progress3 = await wicketModel.findOne({ userId: user._id }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
        let type3 = progress3 ? true : false;


        let Questions = await bow_batModel.findOne({ userId: user._id }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
        user.userQuestion = Questions;

        return res.status(200).send({
            status: true,
            msg: "User login successfull",
            data: {
                userId: user._id,
                name: user.name,
                phone: user.phone,
                join_as: user.join_as,
                email: user.email,
                password: user.password,
                signup_as: user.signup_as,
                user_details_submit: user.user_details_submit,
                userProfile: UserProfile,
                userQuestion: user.userQuestion,
                userBattingProgress: type1,
                userBowlingProgress: type2,
                userWicketProgress: type3,
                token: updateToken.token
            }
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }
};

//=============[Get All Users]=============================
const getUsers = async function (req, res) {
    try {
        let data = req.body;

        let user = await academy_coachModel.find();

        return res.status(201).send({
            status: true,
            msg: "Get All Users",
            data: user
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }
};

//=============[ get contact ]================
const getContact = async function (req, res) {
    try {
        let email = req.body.email;

        let user = await userModel.findOne({ email: email })

        if (!user) {
            return res.status(400).send({
                status: false,
                msg: "This Email are not Registered."
            })
        } else {
            return res.status(200).send({
                status: true,
                msg: "Get Contact",
                data: {
                    phone: user.phone
                }
            })
        }
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }
};

//==========================[Update Password]=================
const updatePassword = async function (req, res) {
    try {
        let data = req.body
        let { email, password } = data;

        let user2 = await userModel.findOne({ email: email });

        const encryptedPassword = bcrypt.hashSync(password, 12)
        data.password = encryptedPassword;

        let user = await userModel.findOneAndUpdate({ email: email }, { $set: { password: encryptedPassword } }, { new: true });

        return res.status(200).send({
            status: true,
            message: "Password Updated Successfully"
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }
};

//===========================[create bat_bow]===============================
const bow_bat = async function (req, res) {
    try {
        let data = req.body;
        let userid = req.params.userId;

        let { bat_hand, bowl_hand, batting_order, bowling_order, bowler_skill, wicket_keeper, userId } = data
        data.userId = userid;

        const actionCreated = await bow_batModel.create(data)

        return res.status(201).send({
            status: true,
            message: "Success",
            data: actionCreated
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//==========================[Update batting_bowling]======================
let updateBat_Bow = async function (req, res) {
    try {
        let data = req.body;
        let userid = req.params.userId;

        let user = await bow_batModel.findOneAndUpdate({ userId: userid }, {
            $set: { bat_hand: data.bat_hand, bowl_hand: data.bowl_hand, batting_order: data.batting_order, bowling_order: data.bowling_order, bowler_skill: data.bowler_skill, wicket_keeper: data.wicket_keeper }
        }, { new: true });

        return res.status(200).send({
            status: true,
            message: "Batting Bowling Updated Successfully",
            data: user
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//==========================[progress screen (batting)]==============================
const createBattings = async function (req, res) {
    try {
        let data = req.body;

        let userid = req.params.userId;

        let { userId, matches, runs, faced, strike_rate, fifty_hundred, average, level, out } = data
        data.userId = userid;

        const battingCreated = await battingModel.create(data)

        return res.status(201).send({
            status: true,
            message: "Battings created successfully",
            data: battingCreated
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//==========================[Update Batting]======================
let updateBatting = async function (req, res) {
    try {
        let data = req.body;
        let userid = req.params.userId;

        let user = await battingModel.findOneAndUpdate({ userId: userid }, {
            $set: { matches: data.matches, runs: data.runs, faced: data.faced, strike_rate: data.strike_rate, fifty_hundred: data.fifty_hundred, average: data.average, level: data.level, out: data.out }
        }, { new: true });

        return res.status(200).send({
            status: true,
            message: "Batting Data Updated Successfully",
            data: user
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//==========================[progress screen (bowling)]==============================
const createBowlings = async function (req, res) {
    try {
        let data = req.body
        let userid = req.params.userId;

        let { userId, matches, overs, wickets, conced, average, economy, threeW_fiveW, wicket_matche, level } = data
        data.userId = userid;

        const bowlingCreated = await bowlingModel.create(data)

        return res.status(201).send({
            status: true,
            message: "Bowling created successfully",
            data: bowlingCreated
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//==========================[Update Bowling]======================
let updateBowling = async function (req, res) {
    try {
        let data = req.body;
        let userid = req.params.userId;

        let user = await bowlingModel.findOneAndUpdate({ userId: userid }, {
            $set: { matches: data.matches, overs: data.overs, wickets: data.wickets, conced: data.conced, average: data.average, economy: data.economy, threeW_fiveW: data.threeW_fiveW, wicket_matche: data.wicket_matche, level: data.level, }
        }, { new: true });

        return res.status(200).send({
            status: true,
            message: "Bowling Data Updated Successfully",
            data: user
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//==========================[progress screen (wicket)]==============================
const createWickets = async function (req, res) {
    try {
        let data = req.body
        let userid = req.params.userId;

        var { userId, level, match, catches, stumps, runout } = data
        data.userId = userid;

        const wicketCreated = await wicketModel.create(data)
        return res.status(201).send({
            status: true,
            message: "Wicket created successfully",
            data: wicketCreated
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//==========================[Update Wicket]======================
let updateWicket = async function (req, res) {
    try {
        let data = req.body;
        let userid = req.params.userId;

        let updateWickets = await wicketModel.findOneAndUpdate({ userId: userid }, {
            $set: { level: data.level, match: data.match, catches: data.catches, stumps: data.stumps, runout: data.runout }
        }, { new: true });

        return res.status(200).send({
            status: true,
            message: "Wicket Data Updated Successfully",
            data: updateWickets
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//==========================[create category]==============================
const category = async function (req, res) {
    try {
        let data = req.body;

        let category = await categoryModel.create(data);
        let obj = {}
        obj["category_id"] = category.category_id
        obj["category_name"] = category.category_name

        return res.status(201).send({
            message: "category created successfully",
            data: obj
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//==========================[Get Category]==============================
const getCategory = async function (req, res) {
    try {
        let body = req.body;

        const Category = await categoryModel.find(body).select({ category_id: 1, category_name: 1, _id: 0 });

        return res.status(200).send({
            status: true,
            message: "success",
            data: Category
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//==========================[create tag]==============================
const tag = async function (req, res) {
    try {
        let data = req.body;

        let tags = await tagModel.create(data);
        let obj = {}
        obj["tag_id"] = tags.tag_id
        obj["tag"] = tags.tag
        obj["category_id"] = tags.category_id
        obj["category_name"] = tags.category_name

        return res.status(201).send({
            message: "tags created successfully",
            data: obj
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//============================[Get Tag]========================================
const getTags = async function (req, res) {
    try {
        let body = req.body;

        const Tag = await tagModel.find(body).select({ tag_id: 1, tag: 1, category_id: 1, category_name: 1, _id: 0 });

        return res.status(200).send({
            status: true,
            data: Tag
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//============================[Create Routine]=========================================
const createRoutine = async function (req, res) {
    try {
        let data = req.body;
        let userid = req.params.userId;

        let { drills, date, time, category, drill_id, repetation, sets, comment, userId, routineId, isCompleted, end_date } = data;
        data.userId = userid;

        let RoutineTime = await routineModel.findOne({ date: date, time: time });
        if (RoutineTime) {
            return res.status(400).send({ status: false, message: "You already have a routine set for this time" })
        }

        let createRoutine = await routineModel.create(data);

        return res.status(201).send({
            message: "Routine set successfully",
            data: {
                userId: createRoutine.userId,
                drills: createRoutine.drills,
                date: createRoutine.date,
                time: createRoutine.time,
                category: createRoutine.category,
                repetation: createRoutine.repetation,
                sets: createRoutine.sets,
                comment: createRoutine.comment,
                drill_id: createRoutine.drill_id,
                routineId: createRoutine._id,
                isCompleted: createRoutine.isCompleted,
                end_date: createRoutine.end_date
            }
        })

    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};
//=======================[Get Routine Count]=======================
const getRoutineCount = async function (req, res) {
    try {

        // let start_date = req.query.date;
        // let end_date = req.query.end_date;
        // let userid = req.params.userId;

        // let getRoutine = await routineModel.find({ userId: userid, date: { $gte: start_date, $lte: end_date } });

        // let categoryIds = Array.from(new Set(getRoutine.map(routine => routine.category)));

        // let results = [];

        // for (let i = 0; i < categoryIds.length; i++) {
        //     let routinesByCategory = getRoutine.filter(routine => routine.category === categoryIds[i]);

        //     let obj = {};

        //     obj.category = categoryIds[i];

        //     let count = routinesByCategory.length;
        //     obj.noOfRoutines = count;

        //     let complete = routinesByCategory.reduce((accumulator, currentValue) => {
        //         return accumulator + currentValue.isCompleted;
        //     }, 0);
        //     obj.completedRoutines = complete;

        //     let reps = routinesByCategory.reduce((accumulator, currentValue) => {
        //         return accumulator + currentValue.repetation;
        //     }, 0);
        //     obj.expected_reps = reps;

        //     let sets = routinesByCategory.reduce((accumulator, currentValue) => {
        //         return accumulator + currentValue.sets;
        //     }, 0);
        //     obj.expected_sets = sets;

        //     let completedReps = routinesByCategory.filter(routine => routine.isCompleted === true);
        //     if (completedReps) {
        //         let repsDone = completedReps.reduce((accumulator, currentValue) => {
        //             return accumulator + currentValue.repetation;
        //         }, 0);
        //         obj.reps_done = repsDone;
        //     }

        //     let completedSets = routinesByCategory.filter(routine => routine.isCompleted === true);
        //     if (completedSets) {
        //         let setsDone = completedSets.reduce((accumulator, currentValue) => {
        //             return accumulator + currentValue.sets;
        //         }, 0);
        //         obj.sets_done = setsDone;
        //     }

        //     results.push(obj);
        // }

        // return res.status(200).send({
        //     status: true,
        //     data: results
        // });

        let startDate = req.query.date;
        let userId = req.params.userId;

        let getRoutine = await routineModel.find({ userId: userId, date: { $lte: startDate } }).sort({ date: 'asc' });

        let results = [];

        for (let i = 0; i < getRoutine.length; i++) {
            let routine = getRoutine[i];

            let obj = {};

            obj.category = routine.category;
            obj.date = routine.date;

            let count = getRoutine.filter(r => r.category === routine.category).length;
            obj.noOfRoutines = count;

            let completedRoutines = getRoutine.filter(r => r.category === routine.category && r.isCompleted).length;
            obj.completedRoutines = completedRoutines;

            let expected_reps = getRoutine.filter(r => r.category === routine.category).reduce((acc, cur) => acc + cur.repetation, 0);
            obj.expected_reps = expected_reps;

            let expected_sets = getRoutine.filter(r => r.category === routine.category).reduce((acc, cur) => acc + cur.sets, 0);
            obj.expected_sets = expected_sets;

            let completedReps = getRoutine.filter(r => r.category === routine.category && r.isCompleted).reduce((acc, cur) => acc + cur.repetation, 0);
            obj.reps_done = completedReps;

            let completedSets = getRoutine.filter(r => r.category === routine.category && r.isCompleted).reduce((acc, cur) => acc + cur.sets, 0);
            obj.sets_done = completedSets;

            results.push(obj);
        }

        return res.status(200).send({
            status: true,
            data: results
        });

    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//========================[Update Drill]===============
const updateRoutine = async function (req, res) {
    try {
        let routineId = req.body.routineId;

        let Routine = await routineModel.findById({ _id: routineId })

        if (Routine.isCompleted == false) {
            var routines = await routineModel.findByIdAndUpdate({ _id: routineId }, { $set: { isCompleted: true } }, { new: true });
        }
        if (Routine.isCompleted == true) {
            var routines = await routineModel.findByIdAndUpdate({ _id: routineId }, { $set: { isCompleted: false } }, { new: true });
        }

        return res.status(200).send({
            status: true,
            message: "Routine Updated Successfully",
            isCompleted: routines.isCompleted
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//=====================[Get Routine]==================================
const getRoutine = async function (req, res) {
    try {

        let date = req.query.date;
        let userId = req.params.userId;

        let routines = await routineModel.find({ userId: userId, date: date });
        console.log(routines, "aaaaa")

        var arr = [];

        for (var i = 0; i < routines.length; i++) {
            var routine = routines[i];

            if (date >= routine.date && date <= routine.end_date) {
                arr.push(routine);
            }
        }
        if (arr.length > 0) {
            return res.status(200).send({
                status: true,
                message: "The routines are currently active",
                data: arr
            });
        } else {
            return res.status(200).send({
                status: true,
                message: "No routines are currently active",
                data: []
            });
        }
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//==============================[Delete Routine]=========================================
const deleteRoutine = async function (req, res) {
    try {
        let routineId = req.query.routineId;

        let updateRoutine = await routineModel.findByIdAndDelete({ _id: routineId })

        res.status(200).send({ status: true, message: 'sucessfully deleted' })

    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//============================[Get My Drills]===================================
const getMyDrills = async function (req, res) {
    try {
        let data = req.query;
        let userid = req.params.userId;
        let { category, title } = data;

        let filter = {}

        if (category) {
            filter.category = category;
        }
        if (title) {
            filter.title = title;
        }

        const drills = await routineModel.find({ userId: userid, isCompleted: false, $or: [filter] }).select({ createdAt: 0, updatedAt: 0, __v: 0 });

        let arr = [];
        for (let i = 0; i < drills.length; i++) {
            arr.push(drills[i])
        }

        return res.status(200).send({
            status: true,
            message: "success",
            data: arr
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//========================[Update Drill]=========================================
const updateDrill = async function (req, res) {
    try {
        let drillId = req.body.drillId;

        let drills = await myDrillModel.findByIdAndUpdate({ _id: drillId }, { $set: { isCompleted: true } }, { new: true })

        return res.status(200).send({
            status: true,
            message: "Drill Updated Successfully"
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//==========================[part-2 (readinessSurveyModel)]===============================
const readinessSurvey = async function (req, res) {
    try {
        let data = req.body

        const createReadinessSurvey = await readinessSurveyModel.create(data)

        let obj = {}
        obj["Sleep"] = createReadinessSurvey.Sleep
        obj["Mood"] = createReadinessSurvey.Mood
        obj["Energy"] = createReadinessSurvey.Energy
        obj["Stressed"] = createReadinessSurvey.Stressed
        obj["Sore"] = createReadinessSurvey.Sore
        obj["Heart_rate"] = createReadinessSurvey.Heart_rate
        obj["Urine_color"] = createReadinessSurvey.Urine_color

        return res.status(201).send({
            status: true,
            message: "Created successfully",
            data: obj
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//==============================[part-2 (Test Details)]========================
const createPowerTest = async function (req, res) {
    try {
        let data = req.body;

        const powerTest = await powerTestModel.create(data);

        let obj = {};

        obj["vertical_jump"] = powerTest.vertical_jump
        obj["squat_jump"] = powerTest.squat_jump
        obj["standing_broad_jump"] = powerTest.standing_broad_jump
        obj["ball_chest_throw"] = powerTest.ball_chest_throw
        obj["hang_cleans"] = powerTest.hang_cleans
        obj["cleans"] = powerTest.cleans
        obj["power_cleans"] = powerTest.power_cleans
        obj["snatch_floor"] = powerTest.snatch_floor
        obj["hang_snatch"] = powerTest.hang_snatch
        obj["split_jerk"] = powerTest.split_jerk

        return res.status(201).send({
            status: true,
            message: "Created successfully",
            data: obj
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//====================================[part-2 (Stength Test)]======================
const createStrengthTest = async function (req, res) {
    try {
        let data = req.body;

        const strengthTest = await strengthTestModel.create(data);

        let obj = {};

        obj["back_squats"] = strengthTest.back_squats
        obj["front_squats"] = strengthTest.front_squats
        obj["conventional_deadlifts"] = strengthTest.conventional_deadlifts
        obj["barbell_bench_press"] = strengthTest.barbell_bench_press
        obj["barbell_bench_pulls"] = strengthTest.barbell_bench_pulls

        return res.status(201).send({
            status: true,
            message: "Created successfully",
            data: obj
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//===================[Get Past Drills]======================================
const getPastDrill = async function (req, res) {
    try {
        let data = req.query;
        let userid = req.params.userId;

        let { category, title } = data;

        let filter = {}

        if (category) {
            filter.category = category;
        }
        if (title) {
            filter.title = title;
        }

        let drills = await routineModel.find({ userId: userid, isCompleted: true, $or: [filter] }).lean();

        for (let i = 0; i < drills.length; i++) {
            let userRecommendation = await recommendationModel.find({ userId: drills[i].userId }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
            drills[i].recommendation = userRecommendation;
        }

        return res.status(200).send({
            status: true,
            message: "success",
            data: drills
        })

        return res.status(200).send({
            status: true,
            message: "success",
            data: drills
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }
};
//==========================[Get Complete Drill]====================================
const getCompleteDrill = async function (req, res) {
    try {
        let data = req.query;
        let userid = req.params.userId;

        let { category, title } = data;

        let filter = {}

        if (category) {
            filter.category = category;
        }
        if (title) {
            filter.title = title;
        }

        const drills = await routineModel.find({ userId: userid, isCompleted: true, $or: [filter] }).select({ createdAt: 0, updatedAt: 0, __v: 0 });

        return res.status(200).send({
            status: true,
            message: "success",
            data: drills
        })

    }
    catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }
}

//************************************[ Acedemy/Coach Section]*************************************
//==========================[Acedmy/coach register]================================================
const createAcademy = async function (req, res) {
    try {
        let data = req.body;
        let { email, phone, join_as, academy_name, password } = data

        if (await academy_coachModel.findOne({ phone: phone }))
            return res.status(400).send({ message: "Phone already exist" })

        if (await academy_coachModel.findOne({ email: email }))
            return res.status(400).send({ message: "Email already exist" })

        const encryptedPassword = bcrypt.hashSync(password, 12)
        req.body['password'] = encryptedPassword;

        let savedData = await academy_coachModel.create(data)
        res.status(201).send({ status: true, data: savedData })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
};

//==========================[Acedmy/coach login]==============================
const AcademyLogin = async function (req, res) {
    try {
        let data = req.body
        let { email, password } = data;

        let academy = await academy_coachModel.findOne({ email: email })

        if (!academy) {
            return res.status(400).send({
                status: false,
                msg: "Email and Password is Invalid"
            })
        };

        let compared = await bcrypt.compare(password, academy.password)
        if (!compared) {
            return res.status(400).send({
                status: false,
                message: "Your password is invalid"
            })
        };

        let token = jwt.sign({
            userId: academy._id,
        }, "project");

        let AcademyProfile = await academyProfile.findOne({ userId: academy._id }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
        let type2 = AcademyProfile ? true : false;
        academy.academy_details_submit = type2;

        return res.status(200).send({
            status: true,
            msg: "User login successfull",
            data: {
                userId: academy._id,
                phone: academy.phone,
                join_as: academy.join_as,
                academy_name: academy.academy_name,
                email: academy.email,
                password: academy.password,
                academy_details_submit: academy.academy_details_submit,
                token: token,
                userProfile: AcademyProfile
            }
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }
};

// =============================[Get AssignedBy Drills]============================================
const getAssignedByDrills = async function (req, res) {
    try {
        let data = req.query;
        let userid = req.params.userId;
        let { category, title } = data;

        let filter = {}

        if (category) {
            filter.category = category;
        }
        if (title) {
            filter.title = title;
        }

        const assignedBydrills = await assignedByModel.find({ assignedBy: userid, $or: [data, filter] }).select({ createdAt: 0, updatedAt: 0, __v: 0 });

        let arr = [];
        for (let i = 0; i < assignedBydrills.length; i++) {
            arr.push(assignedBydrills[i])
        }

        return res.status(200).send({
            status: true,
            message: "success",
            data: arr
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//========================[Get Personal Details]==================================
let getPersonal = async function (req, res) {
    try {
        let userid = req.params.userId;
        let user = await userModel.findById({ _id: userid })

        let UserProfile = await profileModel.findOne({ userId: user._id }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
        let Questions = await bow_batModel.findOne({ userId: user._id }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
        user.userQuestion = Questions;

        return res.status(200).send({
            status: true,
            msg: "User Personal Details",
            data: {
                userProfile: UserProfile,
                userQuestion: user.userQuestion,
            }
        })

    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//=========================[Get User Progress ]=======================================
let getProgress = async function (req, res) {
    try {
        let userid = req.params.userId;
        let user = await userModel.findById({ _id: userid });

        let batting = await battingModel.findOne({ userId: user._id }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0, userId: 0 });
        let bowling = await bowlingModel.findOne({ userId: user._id }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0, userId: 0 });
        let wicket = await wicketModel.findOne({ userId: user._id }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0, userId: 0 });

        return res.status(200).send({
            status: true,
            msg: "User Progress Details",
            data: {
                batting: batting,
                bowling: bowling,
                wicket: wicket
            }
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//=================================[Get All Coach's Users]==============================
let getAllUsers = async function (req, res) {
    try {
        let userid = req.params.userId;

        let allUser = await userModel.find({ academy_id: userid }).lean();

        for (let i = 0; i < allUser.length; i++) {
            let userProfile = await profileModel.findOne({ userId: allUser[i]._id }).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });
            allUser[i].userProfile = userProfile;
        }

        return res.status(200).send({
            status: true,
            msg: "Get All User's",
            data: allUser
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: error.message
        })
    }
};

//==========================[Update Coach Password]=================
const updateCoachPassword = async function (req, res) {
    try {
        let data = req.body
        let { email, password } = data;

        let user2 = await academy_coachModel.findOne({ email: email });

        const encryptedPassword = bcrypt.hashSync(password, 12)
        data.password = encryptedPassword;

        let user = await academy_coachModel.findOneAndUpdate({ email: email }, { $set: { password: encryptedPassword } }, { new: true });

        return res.status(200).send({
            status: true,
            message: "Password Updated Successfully"
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }
};

//=============[ get contact for coach ]=========================
const getContactCoach = async function (req, res) {
    try {
        let email = req.body.email;

        let user = await academy_coachModel.findOne({ email: email })

        if (!user) {
            return res.status(400).send({
                status: false,
                msg: "This Email are not Registered."
            })
        } else {
            return res.status(200).send({
                status: true,
                msg: "Get Contact",
                data: {
                    phone: user.phone
                }
            })
        }
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }
};

//==========================[Calendar Counts ]===========================
const getCalendarCount = async function (req, res) {
    try {

        let start_date = req.query.date;
        let end_date = req.query.end_date;
        let userid = req.params.userId;

        let routines = await routineModel.find({
            userId: userid,
            date: { $gte: start_date, $lte: end_date }
        }).sort({ date: 1 });

        let dates = {};
        routines.forEach((routine) => {
            let date = routine.date;
            if (dates[date]) {
                dates[date].categories.push(routine.category);
            } else {
                dates[date] = {
                    date: date,
                    categories: [routine.category],
                };
            }
        });

        let result = [];
        for (let date in dates) {
            result.push(dates[date]);
        }

        return res.status(200).send({
            status: true,
            data: result,
        });
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }
};
//==========================[Update category for Routine]==============
const updateCategoryRoutine = async function (req, res) {
    try {
        let data = req.body
        let routineId = req.body.routineId;

        let { date, category, isCompleted } = data;

        var routines = await routineModel.findByIdAndUpdate({ _id: routineId }, { $set: data }, { new: true });

        return res.status(200).send({
            status: true,
            message: "Catregory Updated Successfully for Routine",
            data: routines
        })
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }
};
//==========================[Create Score And Remarks]=================================
const scoreAndremark = async function (req, res) {
    try {
        let data = req.body;
        let userid = req.params.userId;

        let { userId, drill_id, remarks, score } = data
        data.userId = userid;

        const scoreAndremarkCreated = await scoreAndremarkModel.create(data)

        return res.status(201).send({
            status: true,
            message: "Success",
            data: scoreAndremarkCreated
        })

    }
    catch (error) {
        return res.status(500).send({
            status: false,
            msg: error.message
        })
    }
}
//============================[Create Routine]=========================================
// const createCoachRoutine = async function (req, res) {
//     try {
//         let data = req.body;
//         let userid = req.params.userId;

//         let { drills, date, time, category, repetation, sets, userId, routineId } = data;
//         data.userId = userid;

//         let RoutineTime = await coachRoutineModel.findOne({ date: date, time: time });
//         if (RoutineTime) {
//             return res.status(400).send({ status: false, message: "You already have a routine set for this time" })
//         }

//         let createCoachRoutine = await coachRoutineModel.create(data);

//         return res.status(201).send({
//             message: "Coach Routine set successfully",
//             data: {
//                 userId: createCoachRoutine.userId,
//                 drills: createCoachRoutine.drills,
//                 date: createCoachRoutine.date,
//                 time: createCoachRoutine.time,
//                 category: createCoachRoutine.category,
//                 repetation: createCoachRoutine.repetation,
//                 sets: createCoachRoutine.sets,
//                 routineId: createCoachRoutine._id
//             }
//         })
//     }
//=================================================================
// let date = req.query.date;
// let userId = req.params.userId;

// let routines = await routineModel.find({ userId: userId });

// let activeRoutine = null;

// var arr = [];

// for (var i = 0; i < routines.length; i++) {
//     var routine = routines[i];

//     if (date >= routine.date && date <= routine.end_date) {
//         activeRoutine = routine;
//         arr.push(activeRoutine)
//     }
// }

// if (activeRoutine) {
//     return res.status(200).send({
//         status: true,
//         message: "The routine is currently active",
//         data: arr
//     });
// } else {
//     return res.status(400).send({
//         status: false,
//         message: "The routine is not currently active",
//         data: []
//     });
// }
//=========================================================================
//     catch (error) {
//         return res.status(500).send({
//             status: false,
//             message: error.message
//         })
//     }
// };

// //=====================[Get Coach Routine]==================================
// const getCoachRoutine = async function (req, res) {
//     try {
//         let data = req.query;
//         let userid = req.params.userId;

//         let { date } = data;

//         let filter = {}

//         if (date) {
//             filter.date = date;
//         }
//         if (userid) {
//             filter.userId = userid
//         }

//         const getRoutines = await coachRoutineModel.find({ $or: [filter] }).sort({ time: data.time })

//         return res.status(200).send({
//             status: true,
//             data: getRoutines
//         })
//     }
//     catch (error) {
//         return res.status(500).send({
//             status: false,
//             message: error.message
//         })
//     }
// };

//=============================================================================================





module.exports = { scoreAndremark, updateCategoryRoutine, getCalendarCount, getRoutineCount, getCompleteDrill, updateRoutine, getContactCoach, updateCoachPassword, getAllUsers, updateBat_Bow, getAssignedByDrills, AcademyLogin, createUser, userLogin, getContact, createBattings, updateBatting, createBowlings, updateBowling, createWickets, updateWicket, bow_bat, createRoutine, deleteRoutine, getRoutine, category, getCategory, getTags, tag, getMyDrills, readinessSurvey, createPowerTest, createStrengthTest, createAcademy, updateDrill, updatePassword, getPastDrill, getPersonal, getProgress, getUsers }


