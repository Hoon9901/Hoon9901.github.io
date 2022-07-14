module.exports = {
  /** Site MetaData (Required all)*/
  title: `Hoon's Blog`,                           // (* Required)
  description: `Hoon's Backend Dev Blog`,          // (* Required)
  author: `Hoon`,                         // (* Required)
  language: 'ko-KR',                        // (* Required) html lang, ex. 'en' | 'en-US' | 'ko' | 'ko-KR' | ...
  siteUrl: 'https://hoon9901.github.io',                      // (* Required)
    // ex.'https://junhobaik.github.io'
    // ex.'https://junhobaik.github.io/' << X, Do not enter "/" at the end.

  /** Header */
  profileImageFileName: '', // include filename extension ex.'profile.jpg'
    // The Profile image file is located at path "./images/"
    // If the file does not exist, it is replaced by a random image.

  /** Home > Bio information*/
  comment: '안녕하세요.',
  name: 'SeongHoon Park',
  company: '',
  location: 'Korea',
  email: 'shonn.dev@gmail.com',
  website: 'https://hoon9901.github.io',           // ex.'https://junhobaik.github.io'
  linkedin: '',                                                          // ex.'https://www.linkedin.com/in/junho-baik-16073a19ab'
  facebook: '',                                                          // ex.'https://www.facebook.com/zuck' or 'https://www.facebook.com/profile.php?id=000000000000000'
  instagram: '',                                                         // ex.'https://www.instagram.com/junhobaik'
  github: 'https://github.com/Hoon9901',                                                            // ex.'https://github.com/junhobaik'

  /** Post */
  enablePostOfContents: true,     // TableOfContents activation (Type of Value: Boolean. Not String)
  disqusShortname: 'hoon9901',            // comments (Disqus sort-name)
  enableSocialShare: true,        // Social share icon activation (Type of Value: Boolean. Not String)

  /** Optional */
  googleAnalytics: 'G-54Y96HW76G',     // Google Analytics TrackingID. ex.'UA-123456789-0'
  googleSearchConsole: 'TVut4Eev_nRy_mm-zysXD0qHgpgA8gdV-PkUrpT5Hbg', // content value in HTML tag of google search console ownership verification. ex.'w-K42k14_I4ApiQKuVPbCRVV-GxlrqWxYoqO94KMbKo'
  googleAdsenseSlot: '',   // Google Adsense Slot. ex.'5214956675'
  googleAdsenseClient: '', // Google Adsense Client. ex.'ca-pub-5001380215831339'
    // Please correct the adsense client number(ex.5001380215831339) in the './static/ads.txt' file.
  naverSearch : '5b2690330086c75c7b3bfa21d1ae6f6d434729e2',
};
