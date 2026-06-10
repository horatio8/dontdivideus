/* Sample electorate data — DEMO ONLY.
   Production: full postcode→district table maintained by campaign staff,
   refreshed after every by-election. Margins are indicative 2022 figures. */
window.DDU_SEATS = [
  { seat: "Hastings", mp: "[Sitting member]", party: "LIB", margin: 1.0, vote: "No", pledges: 412, postcodes: ["3915", "3930", "3931", "3939"] },
  { seat: "Pakenham", mp: "[Sitting member]", party: "ALP", margin: 0.8, vote: "Yes", pledges: 388, postcodes: ["3810", "3978", "3984"] },
  { seat: "Bass", mp: "[Sitting member]", party: "ALP", margin: 1.5, vote: "Yes", pledges: 301, postcodes: ["3995", "3991", "3925"] },
  { seat: "Glen Waverley", mp: "[Sitting member]", party: "ALP", margin: 1.6, vote: "Yes", pledges: 356, postcodes: ["3150", "3149"] },
  { seat: "Ripon", mp: "[Sitting member]", party: "ALP", margin: 1.8, vote: "Yes", pledges: 264, postcodes: ["3350", "3371", "3465"] },
  { seat: "Bayswater", mp: "[Sitting member]", party: "ALP", margin: 2.0, vote: "Yes", pledges: 290, postcodes: ["3153", "3152"] },
  { seat: "Croydon", mp: "[Sitting member]", party: "LIB", margin: 2.2, vote: "No", pledges: 233, postcodes: ["3136", "3134"] },
  { seat: "Box Hill", mp: "[Sitting member]", party: "ALP", margin: 2.8, vote: "Yes", pledges: 312, postcodes: ["3128", "3129"] },
  { seat: "Ashwood", mp: "[Sitting member]", party: "ALP", margin: 3.0, vote: "Yes", pledges: 198, postcodes: ["3147", "3148"] },
  { seat: "South Barwon", mp: "[Sitting member]", party: "ALP", margin: 3.5, vote: "Yes", pledges: 276, postcodes: ["3216", "3217", "3228"] },
  { seat: "Melton", mp: "[Sitting member]", party: "ALP", margin: 3.8, vote: "Yes", pledges: 187, postcodes: ["3337", "3338"] },
  { seat: "Richmond", mp: "[Sitting member]", party: "ALP", margin: 4.1, vote: "Yes", pledges: 96, postcodes: ["3121", "3065", "3067"] }
];
window.DDU_FIND_SEAT = function (postcode) {
  return window.DDU_SEATS.find(function (s) { return s.postcodes.indexOf(String(postcode).trim()) !== -1; });
};
