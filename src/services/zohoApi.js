import { ZOHO } from "../contexts/DataProvider";

const DEFAULT_TRIGGER = [];
const SUCCESS_CODE = "SUCCESS";

export const isApiSuccess = (response) =>
  response?.data?.[0]?.code === SUCCESS_CODE;

export const getRecord = (entity, recordId) =>
  ZOHO.CRM.API.getRecord({ Entity: entity, RecordID: recordId });

export const resizeWidget = () =>
  ZOHO.CRM.UI.Resize({ height: "80%", width: "50%" });

export const getAllRecords = (entity, page = 1, perPage = 200) =>
  ZOHO.CRM.API.getAllRecords({ Entity: entity, page, per_page: perPage });

export const getFieldPicklistValues = async (entity, apiName) => {
  const response = await ZOHO.CRM.META.getFields({ Entity: entity });
  const fields = response?.fields || [];
  const targetField = fields.find((field) => field?.api_name === apiName);
  return (
    targetField?.pick_list_values
      ?.map((item) => item?.actual_value)
      .filter(Boolean) || []
  );
};

export const getRelatedQuotes = (entity, recordId, page = 1, perPage = 10) =>
  ZOHO.CRM.API.getRelatedRecords({
    Entity: entity,
    RecordID: recordId,
    RelatedList: "Quotes",
    page,
    per_page: perPage,
  });

export const updateDealRecord = (entity, apiData) =>
  ZOHO.CRM.API.updateRecord({
    Entity: entity,
    APIData: apiData,
    Trigger: DEFAULT_TRIGGER,
  });

export const createQuoteRecord = (apiData) =>
  ZOHO.CRM.API.insertRecord({
    Entity: "Quotes",
    APIData: apiData,
    Trigger: DEFAULT_TRIGGER,
  });

export const updateQuoteRecord = (apiData) =>
  ZOHO.CRM.API.updateRecord({
    Entity: "Quotes",
    APIData: apiData,
    Trigger: DEFAULT_TRIGGER,
  });

export const delinkQuoteFromDeal = (quoteId) =>
  updateQuoteRecord({
    id: quoteId,
    Deal_Name: {},
  });

export const deleteQuoteRecord = (quoteId) =>
  ZOHO.CRM.API.deleteRecord({
    Entity: "Quotes",
    RecordID: quoteId,
  });

export const searchRecord = (entity, queryKey, queryVal) => {
  ZOHO.CRM.API.searchRecord({
    Entity: entity,
    Type: "criteria",
    Query: `"(${queryKey}:equals:${queryVal})"`,
  });
};
