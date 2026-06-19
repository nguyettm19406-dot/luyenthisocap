export interface EvaluationResult {
  isCorrect: boolean;
  score: number; // 1 for correct, 0 for incorrect
  hasWarning: boolean;
  warningType?: "capitalization" | "diacritics" | "typo" | "none";
  warningMessage?: string;
  cleanUser: string;
}

// Low-level helper to normalize string and remove punctuation/special tokens
export function cleanString(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    // Replace punctuation, special arrows, and hyphens with spaces
    .replace(/[,\.\-\~→>:\/·\(\)\?\!\:\n“”"'\+]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Convert Vietnamese characters to plain Latin characters
export function stripDiacritics(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[oòóọỏõôồốộổỗơờớợởỡ]/g, "o")
    .replace(/[aàáạảãâầấậẩẫăằắặẳẵ]/g, "a")
    .replace(/[eèéẹẻẽêềếệểễ]/g, "e")
    .replace(/[uùúụủũưừứựửữ]/g, "u")
    .replace(/[iìíịỉĩ]/g, "i")
    .replace(/[yỳýỵỷỹ]/g, "y");
}

// Calculate Levenshtein Distance
export function getLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Compute word-overlap percentage
export function getWordOverlapScore(user: string, expected: string): number {
  const userWords = user.split(" ").filter(w => w.length > 0);
  const expectedWords = expected.split(" ").filter(w => w.length > 0);

  if (expectedWords.length === 0) return 0;

  let matchedWords = 0;
  for (const expWord of expectedWords) {
    // Check if the exact word or very close word exists in user's submission
    const found = userWords.some(uWord => {
      if (uWord === expWord) return true;
      const dist = getLevenshteinDistance(uWord, expWord);
      return dist <= 1 && uWord.length > 2; // Allow 1 typo for words longer than 2 characters
    });
    if (found) {
      matchedWords++;
    }
  }

  return matchedWords / expectedWords.length;
}

// Helper to match a sequence of words in userWords allowing minor typos of <= 1 edit distance
function matchSequence(words: string[], target: string[]): boolean {
  if (target.length === 0) return true;
  for (let i = 0; i <= words.length - target.length; i++) {
    let match = true;
    for (let j = 0; j < target.length; j++) {
      const uWord = words[i + j];
      const tWord = target[j];
      if (uWord !== tWord) {
        // Check for 1-character typo if word length is > 2
        const dist = getLevenshteinDistance(uWord, tWord);
        if (dist > 1 || tWord.length <= 2) {
          match = false;
          break;
        }
      }
    }
    if (match) return true;
  }
  return false;
}

// Primary evaluator function
export function evaluateAnswer(userAnswer: string, expectedAnswer: string): EvaluationResult {
  const originalUser = (userAnswer || "").trim();
  const originalExpected = (expectedAnswer || "").trim();

  if (!originalUser) {
    return {
      isCorrect: false,
      score: 0,
      hasWarning: false,
      cleanUser: ""
    };
  }

  // Check if this is Question 9 (7 eras)
  const isQuestion9 = originalExpected.includes("Thời sáng thế") && originalExpected.includes("Thời luật pháp xuất ai cập");

  if (isQuestion9) {
    const cleanUser = cleanString(originalUser);
    const strippedUser = stripDiacritics(cleanUser);
    // Ignore all sequence numbers, circular numbers, indicators
    const userWords = strippedUser.split(" ")
      .filter(w => w.length > 0)
      .filter(w => !/^[0-9①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳]+$/.test(w));

    const targets = [
      ["sang", "the"],
      ["luat", "phap", "xuat", "ai", "cap"],
      ["quan", "xet"],
      ["vua"],
      ["tien", "tri"],
      ["tin", "lanh", "thien", "dang"],
      ["khai", "thi", "tai", "sang", "tao"]
    ];

    let allMatched = true;
    for (const target of targets) {
      if (!matchSequence(userWords, target)) {
        allMatched = false;
        break;
      }
    }

    if (allMatched) {
      return {
        isCorrect: true,
        score: 1,
        hasWarning: false,
        cleanUser
      };
    } else {
      return {
        isCorrect: false,
        score: 0,
        hasWarning: false,
        cleanUser
      };
    }
  }

  // Helper 1: Extract parenthesized optional parts from expected answer
  const PARANTHESES_REGEX = /\(([^)]+)\)/g;
  const rawOptionalParts: string[] = [];
  let match;
  const regexInstance = new RegExp(PARANTHESES_REGEX);
  while ((match = regexInstance.exec(originalExpected)) !== null) {
    rawOptionalParts.push(match[1].trim());
  }

  // Helper 2: Expected answer WITHOUT parentheses (Required components)
  const requiredExpectedRaw = originalExpected.replace(/\(([^)]+)\)/g, " ").replace(/\s+/g, " ").trim();
  
  // Clean all variations
  const cleanUser = cleanString(originalUser);
  const cleanRequiredExpected = cleanString(requiredExpectedRaw);
  const cleanFullExpected = cleanString(originalExpected);

  const strippedUser = stripDiacritics(cleanUser);
  const strippedRequiredExpected = stripDiacritics(cleanRequiredExpected);
  const strippedFullExpected = stripDiacritics(cleanFullExpected);

  // Split into words for structural containment checks
  const userWords = strippedUser.split(" ").filter(w => w.length > 0);
  const reqWords = strippedRequiredExpected.split(" ").filter(w => w.length > 0);
  const fullWords = strippedFullExpected.split(" ").filter(w => w.length > 0);

  // 1. Check for exact matches first
  const isExactFull = cleanUser === cleanFullExpected;
  const isExactRequired = cleanUser === cleanRequiredExpected;
  const isStrippedFull = strippedUser === strippedFullExpected;
  const isStrippedRequired = strippedUser === strippedRequiredExpected;

  // Let's check similarity / distance metrics
  const maxLenFull = Math.max(strippedUser.length, strippedFullExpected.length);
  const distFull = getLevenshteinDistance(strippedUser, strippedFullExpected);
  const simFull = maxLenFull > 0 ? 1 - distFull / maxLenFull : 0;

  const maxLenReq = Math.max(strippedUser.length, strippedRequiredExpected.length);
  const distReq = getLevenshteinDistance(strippedUser, strippedRequiredExpected);
  const simReq = maxLenReq > 0 ? 1 - distReq / maxLenReq : 0;

  // 2. Strict Word-Overlap / Containment Check (to handle extra words perfectly)
  let matchedReqWords = 0;
  reqWords.forEach(reqWord => {
    const found = userWords.some(uWord => {
      if (uWord === reqWord) return true;
      const dist = getLevenshteinDistance(uWord, reqWord);
      return dist <= 1 && reqWord.length > 2;
    });
    if (found) {
      matchedReqWords++;
    }
  });

  // Calculate missing words
  const missingReqCount = reqWords.length - matchedReqWords;
  
  // Decide if they got the required content right
  // We are tolerant with long requirement (length >= 5 allows 1 missing, >= 8 allows 2 missing)
  const maxAllowedMissing = reqWords.length >= 8 ? 2 : (reqWords.length >= 5 ? 1 : 0);
  const gotRequiredRight = reqWords.length > 0 && (missingReqCount <= maxAllowedMissing);

  // Overall isCorrect check
  const isCorrect = isExactFull || isExactRequired || isStrippedFull || isStrippedRequired || (simFull >= 0.72) || (simReq >= 0.72) || gotRequiredRight;

  if (!isCorrect) {
    return {
      isCorrect: false,
      score: 0,
      hasWarning: false,
      cleanUser
    };
  }

  // --- At this point, the answer is deemed CORRECT (isCorrect: true, score: 1) ---

  // Check which optional parts are missing in the user answer
  const missingOptionals: string[] = [];
  rawOptionalParts.forEach(optPart => {
    const cleanOpt = stripDiacritics(cleanString(optPart));
    const optWords = cleanOpt.split(" ").filter(w => w.length > 0);
    if (optWords.length === 0) return;

    // Check if the user words contain this optional phrase words
    let matchedOptWords = 0;
    optWords.forEach(oWord => {
      const found = userWords.some(uWord => {
        if (uWord === oWord) return true;
        const dist = getLevenshteinDistance(uWord, oWord);
        return dist <= 1 && oWord.length > 2;
      });
      if (found) {
        matchedOptWords++;
      }
    });

    // If more than half of the optional phrase words are missing, mark it as missing
    const missingOptWordsCount = optWords.length - matchedOptWords;
    const allowedMissingOpt = optWords.length >= 4 ? 1 : 0;
    if (missingOptWordsCount > allowedMissingOpt) {
      missingOptionals.push(optPart);
    }
  });

  // Check if they wrote extra (surplus) words
  // Let's count words in userWords that don't match any word in fullWords
  let extraWordsCount = 0;
  userWords.forEach(uWord => {
    const foundInExpected = fullWords.some(eWord => {
      if (eWord === uWord) return true;
      const dist = getLevenshteinDistance(uWord, eWord);
      return dist <= 1 && eWord.length > 2;
    });
    if (!foundInExpected) {
      const stopWords = [
        "la", "dung", "va", "co", "la", "cung", "nhu", "cac", "nhung", "thi", 
        "cua", "trong", "ngoac", "cau", "tra", "loi", "la", "chinh", "xac"
      ];
      if (!stopWords.includes(uWord)) {
        extraWordsCount++;
      }
    }
  });

  // Decide if there's significant extra words
  const hasExtraWords = extraWordsCount >= 3;

  // Build the unified warning / note string
  let warningMessage = "";
  let hasWarning = false;

  if (missingOptionals.length > 0) {
    warningMessage = `Bạn thiếu chi tiết trong ngoặc: ${missingOptionals.map(p => `"${p}"`).join(", ")}`;
    hasWarning = true;
  }

  if (hasExtraWords) {
    if (warningMessage) {
      warningMessage += " | Lưu ý thêm: Bạn viết dư thừa một số từ/ý phụ.";
    } else {
      warningMessage = "Bạn trả lời đúng nhưng viết hơi dư thừa một số từ/ý phụ.";
    }
    hasWarning = true;
  }

  // Simple fallbacks for diacritics/capitalization warnings if no other warnings exist
  if (!hasWarning) {
    const isCapitalizationDifferent = originalUser !== originalExpected && 
      originalUser.toLowerCase() === originalUser;
    
    const isDiacriticsDifferent = strippedUser === strippedFullExpected && cleanUser !== cleanFullExpected;

    if (isCapitalizationDifferent) {
      warningMessage = "Quên viết hoa từ quan trọng! Hãy viết hoa trang trọng: \"" + originalExpected + "\"";
      hasWarning = true;
    } else if (isDiacriticsDifferent) {
      warningMessage = "Thiếu hoặc sai dấu tiếng Việt. Bạn nên viết chuẩn: \"" + originalExpected + "\"";
      hasWarning = true;
    }
  }

  return {
    isCorrect: true,
    score: 1,
    hasWarning,
    warningType: hasWarning ? "typo" : "none",
    warningMessage: warningMessage || undefined,
    cleanUser
  };
}
