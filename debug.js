const user = {
  id: "1",
  username: "coach",
  role: "coach"
};
console.log("User:", user);
console.log("isCoach check:", user?.role === "coach");
console.log("currentUser.isCoach check:", user?.isCoach);
