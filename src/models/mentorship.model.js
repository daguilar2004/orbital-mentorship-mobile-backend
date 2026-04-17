const mongoose = require('mongoose');
// TBF

const mentorshipSchema = new mongoose.Schema({
    menteeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentee',
        required: true
    },
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentor',
        required: true
    },

    // RANT:    for some inane reason, Stream decided not to add custom channel/call id's to the SDKs
    //          beware of this foreign key hell referencing literally everywhere
    streamChatChannelId: {    // id for chat channel in Stream associated w/ this mentorship
        type: String,
    },
    phases: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Phase'
}],
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
    }],
    resources: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
    }],
    meetings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meeting',
    }],
    trialPeriod: {  // name is subject to change, supposed to rep whether or not they'v ecompleted module 2
        type: Boolean,
        default: true,
    },
    moduleProgress: [
        {
            moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
            role: { type: String, enum: ['mentor', 'mentee'], required: true },
            moduleOrder: { type: Number, required: true },
            levels: [
                {
                    levelOrder: { type: Number, required: true },
                    responses: [
                        {
                            prompt: String,
                            response: String
                        }
                    ],
                    completedAt: { type: Date },
                    availableAt: { type: Date },
                    
                }
            ],
            xpEarned: { type: Number, default: 0 },
            completedAt: { type: Date },
            availableAt: { type: Date },
        }
    ]    
}, {
    timestamps: true

})

module.exports = mongoose.model('Mentorship', mentorshipSchema);