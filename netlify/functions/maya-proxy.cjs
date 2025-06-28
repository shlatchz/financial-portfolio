const https = require('https');
const { URL } = require('url');

const defaultHeaders = {
  'accept': 'application/json, text/plain, */*',
  'accept-language': 'he-IL',
  'cookie': 'incap_ses_876_108069=YXU/a1yPGBBmRsrJmi0oDLBvVmgAAAAAXOlFSaNK/t4EEYpVLJ01wg==; rxVisitor=17504951572748JP6V26ST1OFD58J3CP9ENG9F020T17I; _ga=GA1.1.301487679.1750495158; _cls_v=34343636-3331-3066-2d34-6536332d3533; _cls_s=34343636-3331-3066-2d34-6536332d3533; rto=c0; _fbp=fb.2.1750495158177.456212010581483511; TS014816ca=01fbbcea6cbc0d0f4e4754885fea7312b3f99bd946cd2d86068ab4b5dbaef8539dda642deb5e7e15773c0836c5e4c2341a895b1b4287c8b6a97e9b2fcf7e834efbfa32b2df; nlbi_2895965=zTdwIEeUdBQJy/gNOnLu2gAAAACVjLtrp2wqjPo2pULd+WGy; user_lang=he; nlbi_1712163=+EM6QG1NEnw1pJmWeEHMmQAAAABh5WYCyx8YctF7kh9kDLcH; incap_ses_1255_1712163=ezEnIwi5zDtAi2FQK6hqEcgfWGgAAAAAqW2Gpbn+hTAAgIgnp0gOBQ==; incap_ses_1168_2862310=l6xaRoxndBTXwoekI5I1EKswWGgAAAAAwHgG/5/tW7BeYhvAX0f+dw==; incap_ses_7213_1712163=Mt5ALrpBA3V2nCArmrkZZEIUWWgAAAAA9/fKk8Luq5FD9rDBUOQ/sA==; incap_ses_1168_2895965=3sKeZqdUkkvRToulI5I1EPaCWWgAAAAAelgvfmarM54ORodnP5OtZg==; incap_ses_1168_1712163=6lJRDivgVWFbT4ulI5I1EPaCWWgAAAAAUAeyMI6EXwm/w/hoeM0K3A==; incap_ses_1168_119456=+nbUOiHPLG2WT4ulI5I1EPaCWWgAAAAAqgVI5Xy/xMiOjx9Et4MCnA==; incap_ses_1255_119455=JzKEcV3vl10Gtp5TK6hqEaIKW2gAAAAAhiI5MBGUxPHhLrm6Z6hLIQ==; dtCookie=v_4_srv_1_sn_4FA77E3FA854A9C4D2F80A12D2BCB1BE_perc_100000_ol_0_mul_1_app-3A03e8062f548da381_1_app-3Ac70ac6ecf011fc02_1_app-3A9b79e0a75ae8d6d6_1_app-3A_1; incap_ses_1255_119456=8yXmK+bx2VAXuZ5TK6hqEaYKW2gAAAAA6k0s6WXyUvxfnSgGqko3rg==; incap_ses_1255_2862310=xCywdak7J2KDuZ5TK6hqEacKW2gAAAAA7efal/YRqEs8yirN759//EA==; incap_ses_1255_2895965=3jiTHCYhQmfbvJ5TK6hqEaoKW2gAAAAAON8gn31MFFbzDoA4SFCrLA==; _legacy_auth0.UBO5RtEOsQVLwCXFLnFfu4kG54ZmawOf.is.authenticated=true; auth0.UBO5RtEOsQVLwCXFLnFfu4kG54ZmawOf.is.authenticated=true; incap_ses_1255_108069=NLUAS3spv0jx0Z5TK6hqEcgfWGgAAAAAZRzB54nhJBEeqIbaaoh41A==; auth0.1AGU7HOvnNpxidQUlPALmBAZUqQ0rsH2.is.authenticated=true; nlbi_2862350=ANOZf1XsIDRuKGLsvwILHwAAAAAZEipiD/Txr/zgI6FWzlNH; incap_ses_1255_2862350=ebJuVYfERTFr1Z5TK6hqEcUKW2gAAAAAsFteypurX+grRUPPUpsOHg==; TS012c9c48=0199a937adf97ce3ab87d560feb2fad713d6eb491f774836eba6afd6e4e8cf345f0fe9da13c38852aacf003fc9a61761a277a5c15b96b02a720e1bf06da16161e0c817aa2c; rxvt=1750799154925|1750796963468; dtPC=1$597354021_737h-vHIDOEMKOLAVKOACRRFMLPKAVMJLSMFSB-0e0; dtSa=true%7CC%7C-1%7C%D7%9E%D7%95%D7%A8%20%D7%9E%D7%97%D7%A7%D7%94%20%D7%A9%D7%97%D7%A8%202-5%7C-%7C1750797373627%7C597354021_737%7Chttps%3A%2F%2Fwww.tase.co.il%2Fhe%7C%7C%7C%7C; visid_incap_119455=6I//NwqgQlK71qO1L0ht26IKW2gAAAAAQUIPAAAAAACKjItDqPR2JsiQzmFlD5Dh; _ga_YM5VBYHPTT=GS2.1.s1750796964$o14$g1$t1750797373$j36$l0$h0',
  'dnt': '1',
  'priority': 'u=1, i',
  'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
};

exports.handler = async (event, context) => {
  // Enable CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Extract fund type and ID from path
    // Expected path: /.netlify/functions/maya-proxy/mutual/5113022 or /etf/1150531
    const pathParts = event.path.split('/');
    const fundType = pathParts[pathParts.length - 2]; // mutual or etf
    const fundId = pathParts[pathParts.length - 1];   // fund ID

    if (!fundType || !fundId || !['mutual', 'etf'].includes(fundType)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid path. Use /mutual/fundId or /etf/fundId' }),
      };
    }

    // Build Maya TASE API URL
    const mayaUrl = `https://maya.tase.co.il/api/v1/funds/${fundType}/${fundId}`;

    // Set dynamic referrer
    const refererPath = fundType === 'mutual' ? 'mutual-funds' : 'etf';
    const headers = {
      ...defaultHeaders,
      'referer': `https://maya.tase.co.il/he/funds/${refererPath}/${fundId}`
    };

    // Make request to Maya TASE
    const response = await makeHttpsRequest(mayaUrl, headers);

    return {
      statusCode: response.statusCode,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: response.body,
    };

  } catch (error) {
    console.error('Maya proxy error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

function makeHttpsRequest(url, headers) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'GET',
      headers: headers,
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: data,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
} 