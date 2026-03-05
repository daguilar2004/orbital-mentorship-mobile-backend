const mongoose = require('mongoose')

// TODO: Finish Mentee schema

const menteeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    badges: [{}], // need some more definition as to what these would look like
    requestedMentors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MentorshipRequest'
    }],
    currentMentorship: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentorship'
    },
    mentorshipHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentorship'
    }],
    module: {
        type: Number,
        default: 1,
        required: true
    },
    profile: {
        bio: {
            type: String,
            maxLength: 2000,
            trim: true
        },
        headline: {
            type: String,
            maxLength: 200,
            trim: true
        },
        goalsForMentorship: {
            type: String,
            maxLength: 2000,
            trim: true
        },
        industryInterests: [{
            type: String
        }],
        desiredSkills: [{
            type: String
        }],
        resumeFileURL: {
            type: String
        },
        linksURLs: [{
            type: String
        }],
        //this is where the streak, xp, rank will be stored
        streak: {
            type: Number
        },
        rank: {
            type: String,
            enum: ['Beginner Adventurer', 'Space explorer', 'Galactic Hero', 'Intergalactic Hero']
        },
        xp: {
            type: Number,
            default: 0
        },
        questionnaireAns: {}, // get specific questions so these can be filled in
        personality: {
            type: String,
            enum: [
                "ISTJ", "ISFJ", "INFJ", "INTJ",
                "ISTP", "ISFP", "INFP", "INTP",
                "ESTP", "ESFP", "ENFP", "ENTP",
                "ESTJ", "ESFJ", "ENFJ", "ENTJ"
              ],
        },
    },

}, {
    timestamps: true
})

module.exports = mongoose.model('Mentee', menteeSchema)