const Router = require("express").Router();
const {
  friend_request,
  accept_request,
  cancel_request,
  unfriend,
  getUserDetails,
  alFriends,
  requested_friend,
  getAllUser,
  addProfilePicture,
  editBio,
  editCover,
  removeCover,
  getPhotos,
  searchUserAdd,
  searchUserRemove,
  visitProfile,
  myFriends,
  hobbiesUpdate,
  socialLinkAdd,
  addFeatureImage,
  liveInCurrentCity,
  CurrentCity,
  relationship,
  phonNumber,
  emailAddress,
  websiteAdd,
  workAdd,
  workRemove,
  all_user_get,
} = require("../Controller/UserController");
const { private } = require("../Helpers/Authenticate");

Router.put("/add_friend/:username", private, friend_request);
Router.put("/accept_request/:username", private, accept_request);
Router.post("/cancel_request/:username", private, cancel_request);
Router.put("/unfriend/:username", private, unfriend);
Router.post("/user", private, getUserDetails);
Router.get("/all_friend", private, alFriends);
Router.get("/request", private, requested_friend);
Router.get("/all_user", private, getAllUser);
Router.put("/avatar", private, addProfilePicture);
Router.post("/get_photo", private, getPhotos);
Router.put("/edit_bio", private, editBio);
Router.put("/cover", private, editCover);
Router.put("/remove_cover", private, removeCover);
Router.put("/search_add", private, searchUserAdd);
Router.put("/search_remove", private, searchUserRemove);
Router.get("/visit_profile/:username", private, visitProfile);
Router.put("/feature", private, visitProfile);
Router.get("/my_friends", private, myFriends);
Router.post("/hobbies", private, hobbiesUpdate);
Router.post("/social", private, socialLinkAdd);
Router.post("/feature", private, addFeatureImage);
Router.post("/live_in", private, liveInCurrentCity);
Router.post("/from_now", private, CurrentCity);
Router.post("/relationship", private, relationship);
Router.post("/phone", private, phonNumber);
Router.post("/email", private, emailAddress);
Router.post("/website", private, websiteAdd);
Router.get("/all-user", all_user_get);

Router.route("/work").post(private, workAdd).put(private, workRemove);

module.exports = Router;
