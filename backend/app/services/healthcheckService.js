import { APP_VERSION } from "../utils/constants.js";
import { execSync } from "child_process";
import { join } from "path";
import logger from "../utils/logger.js";

const getCertInfo = (certPath) => {
  try {
    const certInfo = execSync(`openssl x509 -in ${certPath} -text -noout`, { encoding: 'utf8' });
    const lines = certInfo.split('\n');
    
    let notBefore = null;
    let notAfter = null;
    let subject = null;
    let serialNumber = null;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('Not Before')) {
        const parts = lines[i].split('Not Before:');
        if (parts.length > 1) {
          notBefore = parts[1].trim();
        }
      }
      if (lines[i].includes('Not After')) {
        // Handle "Not After :" with space before colon
        const parts = lines[i].split('Not After :');
        if (parts.length > 1) {
          notAfter = parts[1].trim();
        } else {
          // Try without space
          const parts2 = lines[i].split('Not After:');
          if (parts2.length > 1) {
            notAfter = parts2[1].trim();
          }
        }
      }
      if (lines[i].includes('Subject:')) {
        const parts = lines[i].split('Subject:');
        if (parts.length > 1) {
          subject = parts[1].trim();
        }
      }
      if (lines[i].includes('Serial Number')) {
        const parts = lines[i].split('Serial Number');
        if (parts.length > 1) {
          serialNumber = parts[1].trim();
        }
      }
    }

    return {
      notBefore,
      notAfter,
      subject,
      serialNumber,
      expiresSoon: isExpiringSoon(notAfter)
    };
  } catch (error) {
    logger.error('Error reading certificate:', error);
    return null;
  }
};

const isExpiringSoon = (notAfter) => {
  if (!notAfter) return false;
  
  // Parse the date format from openssl: "Jun 17 01:28:24 2028 GMT"
  // Manual parsing to avoid timezone issues
  const months = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  
  const parts = notAfter.split(' ');
  
  // Format: "Jun 17 01:28:24 2028 GMT"
  const month = months[parts[0]];
  const day = parseInt(parts[1]);
  const timeParts = parts[2].split(':');
  const hours = parseInt(timeParts[0]);
  const minutes = parseInt(timeParts[1]);
  const seconds = parseInt(timeParts[2]);
  const year = parseInt(parts[3]);
  
  const expiryDate = new Date(year, month, day, hours, minutes, seconds);
  
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
  
  return expiryDate < oneMonthFromNow;
};

export const getHealthcheck = async (checkCert = false) => {
  const result = {
    status: "UP",
    version: APP_VERSION,
  };

  if (checkCert) {
    const certPath = process.env.AFIP_CERT_PATH;
    const afipCert = getCertInfo(certPath);
    result.details = {
      afipCert
    };
  }

  return result;
};
