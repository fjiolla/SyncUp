export const isPodMember = (pod, userId) => {
  const userIdStr = userId.toString();
  return (
    pod.organizer.toString() === userIdStr ||
    pod.members.some((memberId) => memberId.toString() === userIdStr)
  );
};
