const User = require('../models/user.model')
const Mentee = require('../models/mentee.model')
const { saveQuestionnaireAnswers } = require('../services/mentee.service')
const { findMentorMatches } = require('../services/matching.service')

/** TESTING CONTROLLER ENDPOINTS
 * ================================
 * getMenteeXp   Tested & functional on server-side. Used mentees/:menteeId/xp API on Postman.
 * ...
 * 
 * */

const getMenteeProfile = async (req, res) => {
    try {
        const menteeId = req.user.mentee_id;
        const mentee = await Mentee.findById(req.params.id);

        // Check if mentee exists
        if (!mentee) {
            return res.status(404).json({ message: 'Mentee not found' });
        }

        // if user of the JWT is NOT owner of the mentee document :id
        if (menteeId != req.params.id) {
            return res.status(200).json({
                name: mentee.name,
                userId: mentee.userId,
                badges: mentee.badges,
                profile: {
                    bio: mentee.profile.bio,
                    headline: mentee.profile.headline,
                    goalsForMentorship: mentee.profile.goalsForMentorship,
                    industryInterests: mentee.profile.industryInterests,
                    desiredSkills: mentee.profile.desiredSkills,
                    linksURLs: mentee.profile.linksURLs,
                    questionnaireAns: mentee.profile.questionnaireAns,
                    personality: mentee.profile.personality,
                    xp: mentee.profile.xp,
                }
            });
        }

        // If the user is the owner, return the full mentee document
        return res.status(200).json(mentee);
            
    }
    catch (error) {
        console.error('Failed to get mentee profile:', error);
        return res.status(500).json({ error: 'Failed to get mentee profile' });
    }
}

// Made specifically for updating experience bar after level submission on mentee side
const getMenteeXp = async (req, res) => {
    try {
        const mentee = await Mentee.findById(req.params.id);

        // Check if mentee exists
        if (!mentee) {
            return res.status(404).json({ message: 'Mentee not found' });
        }

        return res.status(200).json({
            xp: mentee.profile?.xp ?? 0,
        });
    }
    catch (error) {
        console.error('Failed to get mentee xp:', error);
        return res.status(500).json({ error: 'Failed to get mentee xp' });
    }
}

const getQuestionnaireAnswers = async (req, res) => {
    try{
        const menteeId = req.user.mentee_id;
        const mentee = await Mentee.findById(req.params.id);
        // checks if user exists 
        if(!mentee) {
            throw { status: 404, message: "Mentee not found" };
        }

        // gets questionnaire
        if(!mentee.profile || !mentee.profile.questionnaireAns) {
            return res.status(404).json({ message: "Questionnaire answers not found" });
        }
        const questionnaireAns = mentee.profile.questionnaireAns;

        // Check that the user is the owner of the mentee document 
        if(menteeId == req.params.id) {
            return res.status(200).json({
                    questionnaireAns
            })
        }

        // User does not own the mentee document
        throw { status: 401, message: "User is not the owner of this mentee profile" };
        
    }
    catch(error){
        console.error('Failed to get questionnaire answers:', error);
        return res.status(500).json({ error: 'Failed to get questionnaire answers' });
    }
};



// This could be turned into a service function in the future
// if the logic gets more complicated, but for now it is simple enough to be in the
// controller

const editMenteeProfile = async (req, res) => {
    try {
           const  changes  = req.body;
           const menteeId = req.user.mentee_id;
           console.log("req.user at start of editMenteeProfile:", req.user);

           console.log("menteeId from JWT:", menteeId);
           console.log("Requested menteeId:", req.params.id);
           console.log("Changes to apply:", changes);

           // Check if user of the JWT is owner of the mentee document :id
           if (menteeId != req.params.id) return res.status(401).json({ message: "User is not the owner of mentee profile" })
   
           // Only allow updates to profile fields
           if (!changes.profile) {
               return res.status(400).json({ message: "Only profile fields can be updated here" });
           }
   
           // Validate profile field updates
           const allowedProfileFields = [
               'bio',
               'headline',
               'goalsForMentorship',
               'industryExperience',
               'skills',
               'resumeFileURL',
               'linksURLs',
               'questionnaireAns',
               'personality',
               'industryInterests',
               'desiredSkills',
           ];
   
           console.log("validating profile changes:", changes.profile);
           // Filter out any fields that aren't in the allowed list
           const validatedProfileChanges = Object.keys(changes.profile).reduce((acc, key) => {
               if (allowedProfileFields.includes(key)) {
                   acc[key] = changes.profile[key];
               }
               return acc;
           }, {});
   
           console.log("Validated profile changes:", validatedProfileChanges);

           const setObj = {};
           Object.keys(validatedProfileChanges).forEach(key => {
            setObj[`profile.${key}`] = validatedProfileChanges[key];
           });
   
           // Validate field lengths
           if (validatedProfileChanges.bio && validatedProfileChanges.bio.length > 2000) {
               return res.status(400).json({ message: "Bio exceeds maximum length of 2000 characters" });
           }
           if (validatedProfileChanges.whatIcanProvide && validatedProfileChanges.whatIcanProvide.length > 2000) {
               return res.status(400).json({ message: "What I can provide exceeds maximum length of 2000 characters" });
           }
   
           // Update only the profile fields
           const updatedMentee = await Mentee.findByIdAndUpdate(
               menteeId,
               { $set: setObj },
               {
                   new: true,
                   runValidators: true
               }
           );

        return res.status(200).json({
            message: "Mentee profile updated successfully",
            mentee: updatedMentee
        });

    }
    catch (error) {
        console.error('Failed to update MENTEE profile:', error);
        return res.status(500).json({ error: 'Failed to update MENTEE profile' });
    }
}
// where the funcitons to get xp rank and streak will go 

// Handle questionnaire data updates directly
const updateMenteeQuestionnaire = async (req, res) => {
    try {
        const menteeId = req.user.mentee_id;
        const { questionnaire } = req.body;

        // Check if user of the JWT is owner of the mentee document :id
        if (menteeId != req.params.id) {
            return res.status(401).json({ message: "User is not the owner of this mentee profile" });
        }

        // Update the questionnaire data
        const updatedMentee = await Mentee.findByIdAndUpdate(
            menteeId,
            { $set: { 'profile.questionnaireAns': questionnaire } },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedMentee) {
            return res.status(404).json({ message: "Mentee profile not found" });
        }

        return res.status(200).json({
            message: "Mentee questionnaire updated successfully",
            mentee: updatedMentee
        });
    } catch (error) {
        console.error('Failed to update mentee questionnaire:', error);
        return res.status(500).json({ error: 'Failed to update mentee questionnaire' });
    }
};

const deleteMenteeProfile = async (req, res) => {
    try {
        const menteeId = req.user.mentee_id;

        // Check if user of the JWT is owner of the mentee document
        if (menteeId != req.params.id) {
            return res.status(401).json({ message: "User is not the owner of mentee profile" });
        }

        // Delete the mentee profile
        const deletedMentee = await Mentee.findByIdAndDelete(menteeId);

        if (!deletedMentee) {
            return res.status(404).json({ message: "Mentee profile not found" });
        }

        return res.status(200).json({
            message: "Mentee profile deleted successfully"
        });

    } catch (error) {
        console.error('Failed to delete MENTEE profile:', error);
        return res.status(500).json({ error: 'Failed to delete MENTEE profile' });
    }
}

const matchMenteeWithMentors = async (req, res) => {
    const {id} = req.params;
    const questionnaireAns = req.body;
    const menteeId = req.user.mentee_id;

     // checks if the menteeId from the JWT matches the id in the params
    if(id != menteeId) {
        return res.status(401).json({ message: "User is not the owner of mentee profile" });
    }

    try{
        // saves answers to db
        if (!questionnaireAns || Object.keys(questionnaireAns).length === 0) {
            return res.status(400).json({ message: "No questionnaire answers provided" });
        }
        
        
        // sends answers for matching 
        const matches = await findMentorMatches(questionnaireAns);

        return res.status(200).json({ message: "Matches found for Mentee", matches });

    }
    catch(error){
        console.error('matchMenteeWithMentors error:', error);
        const status = error.status || 500;
        return res.status(status).json({ error: error.message });

    }
};

module.exports = {
    getMenteeProfile,
    getMenteeXp,
    getQuestionnaireAnswers,
    matchMenteeWithMentors,
    editMenteeProfile,
    updateMenteeQuestionnaire,
    deleteMenteeProfile,
}


