import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { notifyError, notifySuccess } from "../utils/toast";
import FormModal from "./common/FormModal";
import ModalActions from "./common/ModalActions";
import {
  createQuoteRecord,
  deleteQuoteRecord,
  delinkQuoteFromDeal,
  getRelatedQuotes,
  isApiSuccess,
  updateQuoteRecord,
} from "../services/zohoApi";

export default function RelatedQuotesTable({
  entity,
  entityId,
  accountOptions,
  productOptions,
  quoteStageOptions,
}) {
  const getDefaultProductRow = () => ({
    rowId: Date.now() + Math.random(),
    productId: "",
    quantity: 1,
  });

  const mapQuoteProductsToRows = (productDetails = []) => {
    const rows = productDetails
      .map((product) => ({
        rowId: Date.now() + Math.random(),
        productId: product?.product?.id || "",
        quantity: Number(product?.quantity) || 1,
      }))
      .filter((row) => row.productId);

    return rows.length ? rows : [getDefaultProductRow()];
  };

  const [relatedRecord, setRelatedRecord] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingQuote, setIsSavingQuote] = useState(false);
  const [editProducts, setEditProducts] = useState([getDefaultProductRow()]);
  const [createProducts, setCreateProducts] = useState([
    getDefaultProductRow(),
  ]);
  const [editQuote, setEditQuote] = useState({
    id: "",
    subject: "",
    stage: "",
    total: "",
    accountId: "",
    product_details: [],
  });

  const refreshRelatedQuotes = () => {
    if (!entity || !entityId) {
      setRelatedRecord([]);
      return Promise.resolve();
    }

    return getRelatedQuotes(entity, entityId).then(function (data) {
      setRelatedRecord(data || []);
    });
  };

  useEffect(() => {
    refreshRelatedQuotes();
  }, [entity, entityId]);

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateProducts([getDefaultProductRow()]);
  };

  const openCreateModal = () => {
    setCreateProducts([getDefaultProductRow()]);
    setIsCreateModalOpen(true);
  };

  const handleAddProductRow = () => {
    setCreateProducts((prev) => [...prev, getDefaultProductRow()]);
  };

  const handleRemoveProductRow = (rowId) => {
    setCreateProducts((prev) => {
      if (prev.length === 1) {
        return prev;
      }

      return prev.filter((row) => row.rowId !== rowId);
    });
  };

  const handleCreateProductChange = (rowId, field, value) => {
    setCreateProducts((prev) =>
      prev.map((row) => {
        if (row.rowId !== rowId) {
          return row;
        }
        return {
          ...row,
          [field]: field === "quantity" ? Number(value) : value,
        };
      }),
    );
  };

  const handleCreateQuote = async (event) => {
    event.preventDefault();

    const quoteName = event.target.subject.value;
    const quoteStage = event.target.stage.value;
    const accountId = event.target.accountId.value;

    const productDetails = createProducts
      .filter((row) => row.productId && row.quantity > 0)
      .map((row) => ({
        product: { id: row.productId },
        quantity: parseInt(row.quantity),
      }));

    if (!productDetails.length) {
      notifyError("Add at least one valid product");
      return;
    }

    const quoteData = {
      Subject: quoteName,
      Deal_Name: { id: entityId },
      Quote_Stage: quoteStage,
      Account_Name: { id: accountId },
      Product_Details: productDetails,
    };

    try {
      const createdQuote = await createQuoteRecord(quoteData);
      if (isApiSuccess(createdQuote)) {
        notifySuccess("Quote created successfully");
        await refreshRelatedQuotes();
      }
    } catch (error) {
      console.error("Create quote error:", error);
      notifyError("Failed to create quote");
    }
    closeCreateModal();
  };

  const handleEdit = (id) => {
    const selectedQuote = relatedRecord?.data?.find(
      (record) => record?.id === id,
    );

    if (!selectedQuote) {
      notifyError("Unable to load quote details");
      return;
    }

    setEditQuote({
      id: selectedQuote?.id || "",
      subject: selectedQuote?.Subject || "",
      stage: selectedQuote?.Quote_Stage || "",
      total: selectedQuote?.Grand_Total || "",
      accountId: selectedQuote?.Account_Name?.id || "",
      product_details: selectedQuote?.Product_Details || [],
    });
    console.log(selectedQuote?.Product_Details);
    setEditProducts(
      mapQuoteProductsToRows(selectedQuote?.Product_Details || []),
    );
    setIsEditModalOpen(true);
  };

  const handleEditAddProductRow = () => {
    setEditProducts((prev) => [...prev, getDefaultProductRow()]);
  };

  const handleEditRemoveProductRow = (rowId) => {
    setEditProducts((prev) => {
      if (prev.length === 1) {
        return prev;
      }

      return prev.filter((product) => product.rowId !== rowId);
    });
  };

  const handleEditProductChange = (rowId, field, value) => {
    setEditProducts((prev) =>
      prev.map((product) => {
        if (product.rowId === rowId) {
          return {
            ...product,
            [field]: field === "quantity" ? Number(value) : value,
          };
        }
        return product;
      }),
    );
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setIsSavingQuote(false);
    setEditProducts([getDefaultProductRow()]);
    setEditQuote({
      id: "",
      subject: "",
      stage: "",
      total: "",
      accountId: "",
      product_details: [],
    });
  };

  const handleEditQuoteChange = (event) => {
    const { name, value } = event.target;
    setEditQuote((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuoteUpdate = async (event) => {
    event.preventDefault();

    if (!editQuote?.id) {
      notifyError("Unable to update quote");
      return;
    }

    const productDetails = editProducts
      .filter((row) => row.productId && row.quantity > 0)
      .map((row) => ({
        product: { id: row.productId },
        quantity: parseInt(row.quantity),
      }));

    if (!productDetails.length) {
      notifyError("Add at least one valid product");
      return;
    }

    setIsSavingQuote(true);

    try {
      const apiData = {
        id: editQuote.id,
        Subject: editQuote.subject,
        Quote_Stage: editQuote.stage,
        Grand_Total: editQuote.total,
        Product_Details: productDetails,
      };

      if (editQuote.accountId) {
        apiData.Account_Name = { id: editQuote.accountId };
      }

      const updateResponse = await updateQuoteRecord(apiData);

      if (!isApiSuccess(updateResponse)) {
        throw new Error("Quote update failed");
      }

      await refreshRelatedQuotes();
      notifySuccess("Quote updated successfully");
      closeEditModal();
    } catch (error) {
      console.error("Quote update error:", error);
      notifyError("Failed to update quote");
      setIsSavingQuote(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id || !entity || !entityId) {
      notifyError("Unable to delete quote. Missing record details.");
      return;
    }

    try {
      let deLink = false;
      const deLinked = await delinkQuoteFromDeal(id);
      if (isApiSuccess(deLinked)) {
        deLink = true;
      }

      if (!deLink) {
        const deleteResponse = await deleteQuoteRecord(id);

        if (!isApiSuccess(deleteResponse)) {
          throw new Error("Delete failed");
        }
      }

      await refreshRelatedQuotes();
      notifySuccess("Successfully Removed Quote");
    } catch (error) {
      console.error("Delete error:", error);
      notifyError("Failed to remove quote");
    }
  };

  return (
    <>
      <div className="flex justify-between m-2">
        <h2>Related Quotes</h2>
        <button
          type="button"
          onClick={openCreateModal}
          className="btn btn-neutral"
        >
          Create Quotes
        </button>
      </div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Quote Name</TableCell>
              <TableCell align="right">Account Name</TableCell>
              <TableCell align="right">Stage</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {relatedRecord?.data?.map((record) => (
              <TableRow
                key={record?.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {record?.Subject}
                </TableCell>
                <TableCell align="right">
                  {record?.Account_Name?.name}
                </TableCell>
                <TableCell align="right">{record?.Quote_Stage}</TableCell>
                <TableCell align="right">{record?.Grand_Total}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(record?.id)}
                      className="btn btn-sm"
                    >
                      <ModeEditIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(record?.id)}
                      className="btn btn-sm"
                    >
                      <DeleteForeverIcon />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {isEditModalOpen ? (
        <FormModal title="Edit Quote">
          <form onSubmit={handleQuoteUpdate} className="flex flex-col gap-3">
            <label className="label text-left">Quote Name</label>
            <input
              className="input"
              type="text"
              name="subject"
              value={editQuote.subject}
              onChange={handleEditQuoteChange}
              required
            />
            <label className="label text-left">Account Name</label>
            <select
              className="select select-bordered"
              name="accountId"
              value={editQuote.accountId}
              onChange={handleEditQuoteChange}
            >
              <option value="">Select account</option>
              {accountOptions?.map((account) => (
                <option key={account?.id} value={account?.id}>
                  {account?.Account_Name}
                </option>
              ))}
            </select>
            <label className="label text-left">Quote Stage</label>
            <select
              className="select select-bordered"
              name="stage"
              value={editQuote.stage}
              onChange={handleEditQuoteChange}
            >
              <option value="">Select stage</option>
              {quoteStageOptions?.map((stageOption) => (
                <option key={stageOption} value={stageOption}>
                  {stageOption}
                </option>
              ))}
            </select>
            {editProducts.map((row, index) => (
              <div className="flex items-end gap-2" key={row.rowId}>
                <div className="flex-1">
                  <label className="label text-left mx-1">Product Name</label>
                  <select
                    className="select select-bordered w-full"
                    value={row.productId}
                    required
                    onChange={(event) =>
                      handleEditProductChange(
                        row.rowId,
                        "productId",
                        event.target.value,
                      )
                    }
                  >
                    <option value="">Select product</option>
                    {productOptions?.map((product) => (
                      <option key={product?.id} value={product?.id}>
                        {product?.Product_Name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-left mx-1">Quantity</label>
                  <input
                    className="input w-24"
                    type="number"
                    min="1"
                    step="1"
                    value={row.quantity}
                    onChange={(event) =>
                      handleEditProductChange(
                        row.rowId,
                        "quantity",
                        event.target.value,
                      )
                    }
                    required
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => handleEditRemoveProductRow(row.rowId)}
                  disabled={editProducts.length === 1}
                >
                  Remove
                </button>
                {index === editProducts.length - 1 ? (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={handleEditAddProductRow}
                  >
                    Add Product
                  </button>
                ) : null}
              </div>
            ))}

            <label className="label text-left">Grand Total</label>
            <input
              className="input"
              type="number"
              readOnly
              name="total"
              value={editQuote.total}
              onChange={handleEditQuoteChange}
            />
            <ModalActions
              onCancel={closeEditModal}
              cancelDisabled={isSavingQuote}
              submitDisabled={isSavingQuote}
              submitLabel={isSavingQuote ? "Saving..." : "Save"}
            />
          </form>
        </FormModal>
      ) : null}

      {isCreateModalOpen ? (
        <FormModal title="Create Quote">
          <form onSubmit={handleCreateQuote} className="flex flex-col gap-3">
            <label className="label text-left">Quote Name</label>
            <input
              className="input"
              type="text"
              name="subject"
              placeholder="Quote Name"
              required
            />

            <label className="label text-left ">Quote Stage</label>
            <select className="select select-bordered" name="stage">
              <option value="">Select stage</option>
              {quoteStageOptions?.map((stageOption) => (
                <option key={stageOption} value={stageOption}>
                  {stageOption}
                </option>
              ))}
            </select>

            <label className="label text-left">Account Name</label>
            <select
              className="select select-bordered"
              name="accountId"
              required
            >
              <option value="">Select account</option>
              {accountOptions?.map((account) => (
                <option key={account?.id} value={account?.id}>
                  {account?.Account_Name}
                </option>
              ))}
            </select>

            {createProducts.map((row, index) => (
              <div className="flex items-end gap-2" key={row.rowId}>
                <div className="flex-1">
                  <label className="label text-left mx-1">Product Name</label>
                  <select
                    className="select select-bordered w-full"
                    value={row.productId}
                    onChange={(event) =>
                      handleCreateProductChange(
                        row.rowId,
                        "productId",
                        event.target.value,
                      )
                    }
                    required
                  >
                    <option value="">Select product</option>
                    {productOptions?.map((product) => (
                      <option key={product?.id} value={product?.id}>
                        {product?.Product_Name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-left mx-1">Quantity</label>
                  <input
                    className="input w-24"
                    type="number"
                    min="1"
                    step="1"
                    value={row.quantity}
                    onChange={(event) =>
                      handleCreateProductChange(
                        row.rowId,
                        "quantity",
                        event.target.value,
                      )
                    }
                    required
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => handleRemoveProductRow(row.rowId)}
                  disabled={createProducts.length === 1}
                >
                  Remove
                </button>
                {index === createProducts.length - 1 ? (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={handleAddProductRow}
                  >
                    Add Product
                  </button>
                ) : null}
              </div>
            ))}

            <ModalActions onCancel={closeCreateModal} submitLabel="create" />
          </form>
        </FormModal>
      ) : null}
    </>
  );
}
