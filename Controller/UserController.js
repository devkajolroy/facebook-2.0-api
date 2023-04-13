const PostModel = require("../Models/PostModel");
const UserModel = require("../Models/UserModel");
const Cloudinary = require("cloudinary").v2;

// GEt User DAta
exports.getUserDetails = async (req, res) => {
  const { username } = req.body;
  try {
    const user = await UserModel.findOne({ username })
      .populate({
        path: "search",
        model: UserModel,
        select: "picture first_name last_name username",
      })
      .populate({
        path: "friends",
        model: UserModel,
        select: "username first_name last_name picture",
      });
    const { password, emailVerify, __v, updatedAt, ...other } = user._doc;
    res.status(200).send(other);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Friend Request
exports.friend_request = async (req, res) => {
  if (req.user.username !== req.params.username) {
    try {
      const sender = await UserModel.findOne({ username: req.user.username });
      const receiver = await UserModel.findOne({
        username: req.params.username,
      });

      if (
        !receiver.request.includes(req.user._id) &&
        !receiver.friends.includes(req.user._id)
      ) {
        await receiver.updateOne({
          $push: { request: req.user._id },
        });
        await sender.updateOne({
          $push: { requestTo: receiver._id },
        });
        if (
          !sender.followings.includes(receiver._id) &&
          !receiver.followers.includes(sender._id)
        ) {
          await sender.updateOne({
            $push: { followings: receiver._id },
          });
          await receiver.updateOne({
            $push: { followers: sender._id },
          });
        }
        res.status(200).send({ message: "Request success !" });
      } else {
        res.status(400).send({ message: "Already Friend or Request Send !" });
      }
    } catch (error) {
      res.status(500).send(error);
    }
  } else {
    res.status(400).send({ message: "You can't follow your self !" });
  }
};

// Accept Friend Request
exports.accept_request = async (req, res) => {
  if (req.user.username !== req.params.username) {
    try {
      const sender = await UserModel.findOne({ username: req.params.username });
      const me = await UserModel.findOne({ username: req.user.username });
      if (!sender) return res.status(400).send({ message: "User not found !" });

      if (me.request.includes(sender._id)) {
        await me.updateOne({
          $push: { friends: sender._id, followings: sender._id },
          $pull: { request: sender._id },
        });
        await sender.updateOne({
          $push: { friends: me._id, followers: me._id },
          $pull: { requestTo: me._id },
        });
        res.status(200).send({ message: "Request accept !" });
      } else {
        res.status(200).send({ message: "Not requested !" });
      }
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  } else {
    res.status(400).send({ message: "You can't follow your self !" });
  }
};

// Cancel Request
exports.cancel_request = async (req, res) => {
  try {
    const sender = await UserModel.findOne({ username: req.params.username });
    const receiver = await UserModel.findById(req.user._id);
    if (!sender) return res.status(400).send({ message: "User not found !" });

    if (!receiver.request.includes(sender._id)) {
      res.status(400).send({ message: "Request user not found !!" });
    } else {
      await receiver.updateOne({
        $pull: { request: sender._id },
      });
      await sender.updateOne({
        $pull: { requestTo: receiver._id },
      });
      res.status(200).send({ message: "Cancel request !" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// UnFriend Request
exports.unfriend = async (req, res) => {
  try {
    const friend = await UserModel.findOne({ username: req.params.username });
    const me = await UserModel.findById(req.user._id);
    if (!friend) return res.status(400).send({ message: "User not found !" });
    if (friend.friends.includes(me._id) && me.friends.includes(friend._id)) {
      await friend.updateOne({
        $pull: { followers: me._id, followings: me._id, friends: me._id },
      });
      await me.updateOne({
        $pull: {
          followers: friend._id,
          followings: friend._id,
          friends: friend._id,
        },
      });
      res.status(200).send({ message: "Unfriend success !!" });
    } else {
      res.status(400).send({ message: "Already unfriended !!" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// GEt All Request
exports.alFriends = async (req, res) => {
  try {
    const getAll = await UserModel.find({
      _id: {
        $in: req.user.friends,
      },
    }).select("username  first_name last_name picture");
    res.status(200).send(getAll);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

//All User
exports.all_user_get = async (req, res) => {
  try {
    const getAll = await UserModel.find({}).select(
      "username  first_name last_name picture"
    );
    res.status(200).send(getAll);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// GEt All Request
exports.requested_friend = async (req, res) => {
  const me = await req.user;
  try {
    const getAll = await UserModel.find({
      _id: {
        $in: me.request,
      },
    })
      .sort({ createdAt: -1 })
      .select("username -_id first_name last_name picture");
    res.status(200).send(getAll);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// suggest Friends
exports.getAllUser = async (req, res) => {
  try {
    const all = await UserModel.find({
      _id: {
        $nin: [
          req.user._id,
          ...req.user.requestTo,
          ...req.user.friends,
          ...req.user.request,
        ],
      },
    }).select("username first_name last_name picture");
    res.status(200).send(all);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Profile Picture Add

exports.addProfilePicture = async (req, res) => {
  if (!req.body.image) {
    res.status(200).send({ message: "Not picture added !!" });
  } else {
    try {
      Cloudinary.uploader.upload(
        req.body.image,
        {
          unique_filename: true,
          folder: `facebook/user/${req.user._id}/profile_picture`,
        },
        async (error, result) => {
          if (result) {
            await UserModel.updateOne(
              { _id: req.user._id },
              {
                $set: { picture: result.secure_url },
              },
              { new: true }
            ).exec();

            await PostModel.create({
              type: "profile",
              user: req.user._id,
              images: result.secure_url,
              text: req.body.text,
            });
            res.status(200).send({ message: "Profile picture added !!" });
          }
          if (error) {
            res.status(400).send({ message: error.message });
          }
        }
      );
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  }
};

// GET All Profile Picture
exports.getPhotos = async (req, res) => {
  const { folder, max } = req.body;
  Cloudinary.search
    .expression(
      `resource_type:image AND folder:facebook/user/${req.user._id}${folder}/*`
    )
    .sort_by("created_at", "desc")
    .max_results(max)
    .execute()
    .then((result) => res.status(200).send(result.resources))
    .catch((err) => console.log(err));
};

// Add Bio
exports.editBio = async (req, res) => {
  const { currentCity, homeTown, family, highSchool, collage, work, savePost } =
    req.body;
  if (
    currentCity ||
    homeTown ||
    family ||
    highSchool ||
    collage ||
    work ||
    savePost
  ) {
    return res.send({ message: "You can update only bio" });
  }
  try {
    const update = await UserModel.findOneAndUpdate(
      { _id: req.user._id },
      {
        details: {
          ...req.user.details,
          bio: req.body.bio,
        },
      },
      { new: true }
    );
    res.status(200).send(update);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

// Add Cover
exports.editCover = async (req, res) => {
  if (!req.body.cover) {
    res.status(200).send({ message: "Not picture added !!" });
  } else {
    try {
      Cloudinary.uploader.upload(
        req.body.cover,
        {
          unique_filename: true,
          folder: `facebook/user/${req.user._id}/cover_picture`,
        },
        async (error, result) => {
          if (result) {
            await UserModel.updateOne(
              { _id: req.user._id },
              {
                $set: { cover: result.secure_url },
              },
              { new: true }
            ).exec();

            await PostModel.create({
              type: "cover",
              user: req.user._id,
              images: result.secure_url,
            });
            res.status(200).send({ message: "Cover picture added !!" });
          }
          if (error) {
            res.status(400).send({ message: error.message });
          }
        }
      );
    } catch (error) {
      res.status(400).send({ message: error.message });
    }
  }
};

// Remove Cover to new cover
exports.removeCover = async (req, res) => {
  try {
    await UserModel.updateOne(
      { _id: req.user._id },
      {
        $set: {
          cover:
            "https://res.cloudinary.com/kajolroy/image/upload/v1653506943/facebook/default_image/fb_cover_pr3fez.png",
        },
      },
      { new: true }
    ).exec();
    res.status(400).send({ message: error.message });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Search User add
exports.searchUserAdd = async (req, res) => {
  const { user } = req.body;
  try {
    const CurUser = await UserModel.findById(req.user._id);
    if (user == req.user._id)
      return res.status(200).send({ message: "You dot't add your self !!" });
    if (!CurUser.search.includes(user)) {
      await UserModel.findByIdAndUpdate(req.user._id, {
        $push: { search: user },
      });
    } else {
      res.status(200).send({ message: "Already added !!" });
    }
    res.status(200).send({ message: "added success !!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Search User delete
exports.searchUserRemove = async (req, res) => {
  const { user } = req.body;
  try {
    await UserModel.findByIdAndUpdate(req.user._id, {
      $pull: {
        search: user,
      },
    });
    res.status(200).send({ message: "added success !!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Visit Other Profile
exports.visitProfile = async (req, res) => {
  try {
    const findUser = await UserModel.findOne({ username: req.params.username })
      .populate({
        path: "friends",
        model: UserModel,
        select: "username first_name last_name picture",
      })
      .select("-password");
    if (findUser) {
      res.status(200).send(findUser);
    } else {
      res.status(400).send({ message: "User not Found !!" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// My Friends ALl ID
exports.myFriends = async (req, res) => {
  res.status(200).send(req.user.friends);
};

// Hobbies Add
exports.hobbiesUpdate = async (req, res) => {
  try {
    const { hobbies } = req.body;
    await UserModel.findByIdAndUpdate(req.user._id, {
      $set: {
        hobbies: hobbies,
      },
    });
    res.status(200).send({ message: "Added success !!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Social Link Add
exports.socialLinkAdd = async (req, res) => {
  try {
    const { social, link } = req.body;
    if (social == "youtube") {
      await UserModel.findByIdAndUpdate(req.user._id, {
        details: {
          ...req.user.details,
          social: {
            ...req.user.details.social,
            youtube: link,
          },
        },
      });
      res.status(200).send({ message: "Added success !!" });
    } else if (social == "twitter") {
      await UserModel.findByIdAndUpdate(req.user._id, {
        details: {
          ...req.user.details,
          social: {
            ...req.user.details.social,
            twitter: link,
          },
        },
      });
      res.status(200).send({ message: "Added success !!" });
    } else if (social == "instagram") {
      await UserModel.findByIdAndUpdate(req.user._id, {
        details: {
          ...req.user.details,
          social: {
            ...req.user.details.social,
            instagram: link,
          },
        },
      });
      res.status(200).send({ message: "Added success !!" });
    } else if (social == "linkedin") {
      await UserModel.findByIdAndUpdate(req.user._id, {
        details: {
          ...req.user.details,
          social: {
            ...req.user.details.social,
            linkedin: link,
          },
        },
      });
      res.status(200).send({ message: "Added success !!" });
    } else if (social == "tumbler") {
      await UserModel.findByIdAndUpdate(req.user._id, {
        details: {
          ...req.user.details,
          social: {
            ...req.user.details.social,
            tumbler: link,
          },
        },
      });
      res.status(200).send({ message: "Added success !!" });
    } else if (social == "pinterest") {
      await UserModel.findByIdAndUpdate(req.user._id, {
        details: {
          ...req.user.details,
          social: {
            ...req.user.details.social,
            pinterest: link,
          },
        },
      });
      res.status(200).send({ message: "Added success !!" });
    } else if (social == "github") {
      await UserModel.findByIdAndUpdate(req.user._id, {
        details: {
          ...req.user.details,
          social: {
            ...req.user.details.social,
            github: link,
          },
        },
      });
      res.status(200).send({ message: "Added success !!" });
    } else if (social == "skype") {
      await UserModel.findByIdAndUpdate(req.user._id, {
        details: {
          ...req.user.details,
          social: {
            ...req.user.details.social,
            skype: link,
          },
        },
      });
      res.status(200).send({ message: "Added success !!" });
    } else {
      return res.status(400).send({ message: "Wrong information !" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Feature image Add
exports.addFeatureImage = async (req, res) => {
  try {
    const { images } = req.body;
    if (images.length < 1)
      return res.status(400).send({ message: "Select photo and try agin !" });
    let uploaded = [];
    images.forEach(async (item) => {
      uploaded.push(
        Cloudinary.uploader.upload(item, {
          folder: `facebook/user/${req.user._id}/post_picture`,
        })
      );
    });
    const response = await Promise.all(uploaded);
    await UserModel.findByIdAndUpdate(req.user._id, {
      featureImage: response.map((x) => x.secure_url),
    });
    res.status(200).send({ message: "Successfully created !!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Current City Changer
exports.liveInCurrentCity = async (req, res) => {
  const { city } = req.body;
  try {
    await UserModel.findByIdAndUpdate(req.user._id, {
      details: {
        ...req.user.details,
        currentCity: {
          name: city,
        },
      },
    });
    res.status(200).send({ message: "Updated your place !" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Current City Changer
exports.CurrentCity = async (req, res) => {
  const { city } = req.body;
  try {
    await UserModel.findByIdAndUpdate(req.user._id, {
      details: {
        ...req.user.details,
        homeTown: {
          name: city,
        },
      },
    });
    res.status(200).send({ message: "Updated your place !" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Current City Changer
exports.relationship = async (req, res) => {
  const { status } = req.body;
  try {
    await UserModel.findByIdAndUpdate(req.user._id, {
      details: {
        ...req.user.details,
        relationship: status,
      },
    });
    res.status(200).send({ message: "Updated your Relationship !" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Current City Changer
exports.phonNumber = async (req, res) => {
  const { number } = req.body;
  try {
    await UserModel.findByIdAndUpdate(req.user._id, {
      phone: number,
    });
    res.status(200).send({ message: "Added success !" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
// Current City Changer
exports.emailAddress = async (req, res) => {
  const { email } = req.body;
  try {
    await UserModel.findByIdAndUpdate(req.user._id, {
      email,
    });
    res.status(200).send({ message: "Added success !" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
// Current City Changer
exports.websiteAdd = async (req, res) => {
  const { website } = req.body;
  try {
    await UserModel.findByIdAndUpdate(req.user._id, {
      details: {
        ...req.user.details,
        website,
      },
    });
    res.status(200).send({ message: "Added success !" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
// Current City Changer
exports.workAdd = async (req, res) => {
  try {
    await UserModel.findByIdAndUpdate(req.user._id, {
      $push: {
        work: req.body,
      },
    });
    res.status(200).send({ message: "Added success !" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Current City Changer
exports.workRemove = async (req, res) => {
  const { workId } = req.body;
  try {
    await UserModel.findByIdAndUpdate(req.user._id, {
      $pull: {
        work: { _id: workId },
      },
    });
    res.status(200).send({ message: "Added success !" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
