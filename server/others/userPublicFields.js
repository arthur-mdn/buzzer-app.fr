const USER_PUBLIC_FIELDS = 'userId userName userPicture userRole creation';

const USER_PROFILE_PROJECTION = {
    userId: 1,
    userName: 1,
    userPicture: 1,
    userRole: 1,
    creation: 1,
};

module.exports = {
    USER_PUBLIC_FIELDS,
    USER_PROFILE_PROJECTION,
};
