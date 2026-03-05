const User = require('../models/user.model')
const Mentor = require('../models/mentor.model')

// TODO: ping these controllers' endpoints and test them

const getMentorProfile = async (req, res) => {
    try {
        const mentorId = req.user.mentor_id;
        const mentor = await Mentor.findById(req.params.id);

        // Check if mentor exists
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        // If user of the JWT is NOT owner of the mentor document :id
        if (mentorId != req.params.id) {
            return res.status(200).json({
                name: mentor.name,
                userId: mentor.userId,
                badges: mentor.badges,
                profile: {
                    bio: mentor.profile.bio,
                    headline: mentor.profile.headline,
                    whatIcanProvide: mentor.profile.whatIcanProvide,
                    industryExperience: mentor.profile.industryExperience,
                    skills: mentor.profile.skills,
                    resumeFileURL: mentor.profile.resumeFileURL,
                    linksURLs: mentor.profile.linksURLs,
                    questionnaireAns: mentor.profile.questionnaireAns,
                    personality: mentor.profile.personality,
                    xp: mentor.profile.xp,
                }
            });
        }

        // If the user is the owner, return the full mentor document
        return res.status(200).json(mentor);
            
    }
    catch (error) {
        console.error('Failed to get mentor profile:', error);
        return res.status(500).json({ error: 'Failed to get mentor profile' });
    }
}
const getAllMentors = async (req, res) => {
    try{
        const mentors = await Mentor.find().sort({ createdAt: -1 });

        if (mentors.length === 0) {
            return res.status(404).json({ message: "No mentors found" });
        }

       return res.status(200).json(mentors);

    }
    catch(error){
        console.error('Failed to get all mentors:', error);
        return res.status(500).json({ error: 'Failed to get all mentors' });
    }
}

const editMentorProfile = async (req, res) => {
    try {
        const  changes  = req.body;
        const mentorId = req.user.mentor_id;

        // Check if user of the JWT is owner of the mentor document :id
        if (mentorId != req.params.id) return res.status(401).json({ message: "User is not the owner of mentor profile" })

        // Only allow updates to profile fields
        if (!changes.profile) {
            return res.status(400).json({ message: "Only profile fields can be updated here" });
        }

        // Validate profile field updates
        const allowedProfileFields = [
            'bio',
            'headline',
            'whatIcanProvide',
            'industryExperience',
            'skills',
            'resumeFileURL',
            'linksURLs',
            'personality',
            'questionnaireAns'

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

        // Validate field lengths
        if (validatedProfileChanges.bio && validatedProfileChanges.bio.length > 2000) {
            return res.status(400).json({ message: "Bio exceeds maximum length of 2000 characters" });
        }
        if (validatedProfileChanges.whatIcanProvide && validatedProfileChanges.whatIcanProvide.length > 2000) {
            return res.status(400).json({ message: "What I can provide exceeds maximum length of 2000 characters" });
        }

        // Get current mentor profile
        const currentMentor = await Mentor.findById(mentorId);
        if (!currentMentor) {
            return res.status(404).json({ message: "Mentor profile not found" });
        }

        // Merge the changes with existing profile data
        const updatedProfile = {
            ...currentMentor.profile.toObject(),
            ...validatedProfileChanges
        };

        // Update only the profile fields while preserving questionnaireAns
        const updatedMentor = await Mentor.findByIdAndUpdate(
            mentorId,
            { $set: { profile: updatedProfile } },
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            message: "Mentor profile updated successfully",
            mentor: updatedMentor
        });

    }
    catch (error) {
        console.error('Failed to update MENTOR profile:', error);
        return res.status(500).json({ error: 'Failed to update MENTOR profile' });
    }
}

// Handle questionnaire data updates directly
const updateMentorQuestionnaire = async (req, res) => {
    try {
        const mentorId = req.user.mentor_id;
        const { questionnaire } = req.body;

        // Check if user of the JWT is owner of the mentor document :id
        if (mentorId != req.params.id) {
            return res.status(401).json({ message: "User is not the owner of this mentor profile" });
        }

        // Update the questionnaire data
        const updatedMentor = await Mentor.findByIdAndUpdate(
            mentorId,
            { $set: { 'profile.questionnaireAns': questionnaire } },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedMentor) {
            return res.status(404).json({ message: "Mentor profile not found" });
        }

        return res.status(200).json({
            message: "Mentor questionnaire updated successfully",
            mentor: updatedMentor
        });
    } catch (error) {
        console.error('Failed to update mentor questionnaire:', error);
        return res.status(500).json({ error: 'Failed to update mentor questionnaire' });
    }
};

const deleteMentorProfile = async (req, res) => {
    try {
        const mentorId = req.user.mentor_id;

        // Check if user of the JWT is owner of the mentor document
        if (mentorId != req.params.id) {
            return res.status(401).json({ message: "User is not the owner of mentor profile" });
        }

        // Delete the mentor profile
        const deletedMentor = await Mentor.findByIdAndDelete(mentorId);

        if (!deletedMentor) {
            return res.status(404).json({ message: "Mentor profile not found" });
        }

        return res.status(200).json({
            message: "Mentor profile deleted successfully"
        });

    } catch (error) {
        console.error('Failed to delete MENTOR profile:', error);
        return res.status(500).json({ error: 'Failed to delete MENTOR profile' });
    }
}


module.exports = {
    getMentorProfile,
    getAllMentors,
    editMentorProfile,
    updateMentorQuestionnaire,
    deleteMentorProfile,
}

