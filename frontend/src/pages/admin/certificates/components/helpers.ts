import { GetRegistrationsByPostId } from '../../../../services/registrationService';
import type { ParticipantType } from './types';

export const GetParticipantsByActivity = async (activityId: string | number): Promise<ParticipantType[]> => {
    try {
        const res = await GetRegistrationsByPostId(Number(activityId));

        if (res && res.status === 200 && res.data) {
            let registrations: any[] = [];
            if (Array.isArray(res.data)) {
                registrations = res.data;
            } else if (res.data && Array.isArray((res.data as any).data)) {
                registrations = (res.data as any).data;
            }

            const participants: ParticipantType[] = [];

        
            registrations.forEach((reg: any) => {
                // Get all users in this registration (Team or Individual)
                const users = Array.isArray(reg.users) && reg.users.length > 0
                    ? reg.users
                    : (reg.User ? [reg.User] : []);

                // Get award from results if exists
                let awardName = "-";
                if (Array.isArray(reg.results) && reg.results.length > 0 && reg.results[0].award) {
                    awardName = reg.results[0].award.award_name;
                } else if (reg.Result && reg.Result.award) {
                    awardName = reg.Result.award.award_name;
                }

                users.forEach((user: any) => {
                    participants.push({
                        key: `${reg.ID}-${user.ID}`,
                        studentId: user.student_id || user.sut_id || "N/A",
                        name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "N/A",
                        department: user.major?.name || "-",
                        award: awardName
                    });
                });
            });

            if (participants.length > 0) {
                return participants;
            }
        }

        console.log(`No data found for Activity ID: ${activityId}, using empty list.`);
        return [];
    } catch (error) {
        console.error(error);
        return [];
    }
};
