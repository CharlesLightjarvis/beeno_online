import { usePresenceChannel } from '@laravel/echo-react';
import { useEffect } from 'react';

type PresenceMember = { id: string | number };

function participationChannel(sessionId: string, participationId: string) {
    return `exam-sessions.${sessionId}.participations.${participationId}.presence`;
}

export function ExamSessionPresenceJoiner({
    sessionId,
    participationId,
}: {
    sessionId: string;
    participationId: string;
}) {
    usePresenceChannel(participationChannel(sessionId, participationId));

    return null;
}

export function ExamSessionPresenceListener({
    sessionId,
    participationId,
    onPresenceChange,
}: {
    sessionId: string;
    participationId: string;
    onPresenceChange: (participationId: string, online: boolean) => void;
}) {
    const { channel } = usePresenceChannel(
        participationChannel(sessionId, participationId),
    );

    useEffect(() => {
        const presence = channel();

        if (!presence) {
            return;
        }

        const isStudent = (member: PresenceMember) =>
            String(member.id) === 'student';

        presence.here((members: PresenceMember[]) => {
            onPresenceChange(participationId, members.some(isStudent));
        });
        presence.joining((member: PresenceMember) => {
            if (isStudent(member)) {
                onPresenceChange(participationId, true);
            }
        });
        presence.leaving((member: PresenceMember) => {
            if (isStudent(member)) {
                onPresenceChange(participationId, false);
            }
        });
    }, [channel, onPresenceChange, participationId]);

    return null;
}
