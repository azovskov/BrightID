import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RESET_STORE } from '@/actions/resetStore';

const initialState: UserState = {
  isSponsored: false, // server-side sponsored flag, used by v5 apps
  isSponsoredv6: false, // client-side sponsored flag, used by v6 apps
  name: '',
  photo: { filename: '' },
  searchParam: '',
  backupCompleted: false,
  id: '',
  password: '',
  verifications: [],
  secretKey: '',
  eula: false,
  updateTimestamps: {
    backupCompleted: 0,
    isSponsored: 0,
    isSponsoredv6: 0,
    photo: 0,
    name: 0,
    password: 0,
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // v5 sponsored is not used anymore and should be merged by v6 into a single sponsored status
    // after most users loaded their v5 sponsored status from nodes by opening their apps
    setIsSponsored(state, action) {
      state.isSponsored = action.payload;
      state.updateTimestamps.isSponsored = Date.now();
    },
    setIsSponsoredv6(state, action) {
      state.isSponsoredv6 = action.payload;
      state.updateTimestamps.isSponsoredv6 = Date.now();
    },
    setPhoto(state, action) {
      state.photo = action.payload;
      state.updateTimestamps.photo = Date.now();
    },
    setSearchParam(state, action: PayloadAction<string>) {
      state.searchParam = action.payload;
    },
    setEula(state, action) {
      state.eula = action.payload;
    },
    setUserData(state, action) {
      const { id, name, photo, secretKey } = action.payload;
      state.photo = photo;
      state.name = name;
      state.id = id;
      state.secretKey = secretKey;
      const t = Date.now();
      state.updateTimestamps.name = t;
      state.updateTimestamps.photo = t;
    },
    setName(state, action) {
      state.name = action.payload;
      state.updateTimestamps.name = Date.now();
    },
    setBackupCompleted(state, action) {
      state.backupCompleted = action.payload;
      state.updateTimestamps.backupCompleted = Date.now();
    },
    setPassword(state, action) {
      state.password = action.payload;
      state.updateTimestamps.password = Date.now();
    },
    setUserId(state, action) {
      state.id = action.payload;
    },
    setVerifications(state, action: PayloadAction<Array<Verification>>) {
      state.verifications = action.payload;
    },
    hydrateUser(state, action) {
      const { name, photo, backupCompleted, id, password } = action.payload;

      state.backupCompleted = backupCompleted;
      state.name = name;
      state.photo = photo;
      state.id = id;
      state.password = password;
    },
  },
  extraReducers: {
    [RESET_STORE]: () => {
      return initialState;
    },
  },
});

export const {
  setIsSponsored,
  setIsSponsoredv6,
  setPhoto,
  setSearchParam,
  setUserData,
  setName,
  setBackupCompleted,
  setPassword,
  setUserId,
  setVerifications,
  setEula,
  hydrateUser,
} = userSlice.actions;

export const userSelector = (state: State): User => ({
  id: state.user.id,
  name: state.user.name,
  photo: state.user.photo,
  password: state.user.password,
  secretKey: state.user.secretKey,
});

// Export reducer
export default userSlice.reducer;
