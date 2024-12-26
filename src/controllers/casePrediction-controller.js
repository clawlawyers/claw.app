const { StatusCodes } = require("http-status-codes");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { getUserById } = require("../services/user-service");
const { CasePredictionService } = require("../services");

async function createUserId(req, res) {
  try {
    const userId = await CasePredictionService.getUserId();

    return res.status(StatusCodes.OK).json(SuccessResponse(userId));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function caseDetails(req, res) {
  try {
    const { user_id, case_type, jurisdiction, case_overview } = req.body;
    const caseDetails = await CasePredictionService.getCaseDetails({
      user_id,
      case_type,
      jurisdiction,
      case_overview,
    });
    return res.status(StatusCodes.OK).json(SuccessResponse(caseDetails));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function evidenceDetails(req, res) {
  try {
    const { user_id, evidence } = req.body;
    const evidenceDetails = await CasePredictionService.getEvidenceDetails({
      user_id,
      evidence,
    });
    return res.status(StatusCodes.OK).json(SuccessResponse(evidenceDetails));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function caseDocument(req, res) {
  try {
    const file = req.file;
    const documentDetails = await CasePredictionService.getDocumentDetails({
      file,
    });
    return res.status(StatusCodes.OK).json(SuccessResponse(documentDetails));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function evidenceDocument(req, res) {
  try {
    const file = req.file;
    const type = req.body.type;
    const evidenceDocumentDetails =
      await CasePredictionService.getEvidenceDocumentDetails({
        file,
        type,
      });
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse(evidenceDocumentDetails));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function witnessDetails(req, res) {
  try {
    const { user_id, witness_statement } = req.body;
    const witnessDetails = await CasePredictionService.getWitnessDetails({
      user_id,
      witness_statement,
    });
    return res.status(StatusCodes.OK).json(SuccessResponse(witnessDetails));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function evidenceAnalysis(req, res) {
  try {
    const { user_id } = req.body;
    const evidenceAnalysis = await CasePredictionService.getEvidenceAnalysis({
      user_id,
    });
    return res.status(StatusCodes.OK).json(SuccessResponse(evidenceAnalysis));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function proceduralCompliance(req, res) {
  try {
    const { user_id } = req.body;
    const proceduralCompliance =
      await CasePredictionService.getProceduralCompliance({
        user_id,
      });
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse(proceduralCompliance));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function legalFactors(req, res) {
  try {
    const { user_id } = req.body;
    const legalFactors = await CasePredictionService.getLegalFactors({
      user_id,
    });
    return res.status(StatusCodes.OK).json(SuccessResponse(legalFactors));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function cost(req, res) {
  try {
    const { user_id } = req.body;
    const cost = await CasePredictionService.getCost({
      user_id,
    });
    return res.status(StatusCodes.OK).json(SuccessResponse(cost));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function recommendation(req, res) {
  try {
    const { user_id } = req.body;
    const recommendation = await CasePredictionService.getRecommendation({
      user_id,
    });
    return res.status(StatusCodes.OK).json(SuccessResponse(recommendation));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function dbGenerate(req, res) {
  try {
    const { user_id } = req.body;
    await CasePredictionService.getDbGenerate({
      user_id,
    });
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse("Database generated successfully"));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function askQuery(req, res) {
  try {
    const { user_id, query } = req.body;
    const queryResponse = await CasePredictionService.getQueryResponse({
      user_id,
      query,
    });
    return res.status(StatusCodes.OK).json(SuccessResponse(queryResponse));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function winProbability(req, res) {
  try {
    const { user_id } = req.body;
    const winProbability = await CasePredictionService.getWinProbability({
      user_id,
    });
    return res.status(StatusCodes.OK).json(SuccessResponse(winProbability));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function OverallScore(req, res) {
  try {
    const { user_id } = req.body;
    const overallScore = await CasePredictionService.getOverallScore({
      user_id,
    });
    return res.status(StatusCodes.OK).json(SuccessResponse(overallScore));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function EndSession(req, res) {
  try {
    const { user_id } = req.body;
    await CasePredictionService.getEnd({ user_id });
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse("Session ended successfully"));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

module.exports = {
  createUserId,
  caseDetails,
  evidenceDetails,
  caseDocument,
  evidenceDocument,
  witnessDetails,
  evidenceAnalysis,
  proceduralCompliance,
  legalFactors,
  cost,
  recommendation,
  dbGenerate,
  askQuery,
  winProbability,
  OverallScore,
  EndSession,
};
