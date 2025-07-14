// middlewares/validationMiddleware.js

// 공통 검증 함수들
export const validateRequired = (fields) => {
  return (req, res, next) => {
    const missingFields = [];

    for (const field of fields) {
      if (!req.body[field] || req.body[field].toString().trim() === "") {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `필수 항목이 누락되었습니다: ${missingFields.join(", ")}`,
      });
    }

    next();
  };
};

export const validateId = (paramName = "id") => {
  return (req, res, next) => {
    const id = Number(req.params[paramName]);

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        message: `유효하지 않은 ${paramName}입니다.`,
      });
    }

    // req.params[paramName] = id;
    next();
  };
};

export const validateContent = (req, res, next) => {
  const { content } = req.body;

  if (!content || content.trim() === "") {
    return res.status(400).json({
      message: "내용을 입력해주세요.",
    });
  }

  if (content.length > 1000) {
    return res.status(400).json({
      message: "내용은 1000자 이하로 입력해주세요.",
    });
  }

  req.body.content = content.trim();
  next();
};

export function validatePetData(req, res, next) {
  const { name, species, gender } = req.body;

  if (!name || !species || !gender) {
    return res.status(400).json({ message: "name은(는) 필수 항목입니다." });
  }

  // 이름 길이 검증
  if (name.length > 50) {
    return res.status(400).json({
      message: "이름은 50자 이하로 입력해주세요.",
    });
  }

  next();
}

// 에러 응답 표준화
export const sendErrorResponse = (res, statusCode, message, details = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

// 성공 응답 표준화
export const sendSuccessResponse = (
  res,
  data = null,
  message = "성공",
  statusCode = 200
) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};
