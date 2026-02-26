import { notifyError, notifySuccess } from "../utils/toast";
import { getRecord, isApiSuccess, updateDealRecord } from "../services/zohoApi";
export default function DealUpdateForm({
  recordData,
  accountOptions,
  dealStatusOptions,
  setRecordData,
  entity,
  entityId,
}) {
  const deal_name = recordData?.data?.[0]?.Deal_Name;
  const account_name = recordData?.data?.[0]?.Account_Name?.name;
  const account_id = recordData?.data?.[0]?.Account_Name?.id;
  const email = recordData?.data?.[0]?.Email;
  const Status = recordData?.data?.[0]?.Status;
  const amount = recordData?.data?.[0]?.Amount;
  const website = recordData?.data?.[0]?.Website;

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated_deal_name = e.target.deal_name.value;
    const updated_account_id = e.target.account_name.value;
    const updated_email = e.target.email.value;
    const updated_amount = e.target.amount.value;
    const updated_status = e.target.status.value;
    const updated_website = e.target.website.value;
    const apiData = {
      id: entityId,
      Deal_Name: updated_deal_name,
      Account_Name: { id: updated_account_id },
      Email: updated_email,
      Amount: updated_amount,
      Status: updated_status,
      Website: updated_website,
    };

    updateDealRecord(entity, apiData)
      .then(function (data) {
        if (isApiSuccess(data)) {
          notifySuccess("Successfully Updated");
          getRecord(entity, entityId).then(function (refreshedData) {
            setRecordData(refreshedData);
          });
        } else {
          notifyError("Error");
        }
      })
      .catch(function (error) {
        console.error("Update error:", error);
        notifyError("Error");
      });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2 className="flex mx-2">Deal Details Section</h2>
        <div className="flex gap-2 justify-around p-4 m-2 border-2 rounded-xl">
          <div className="flex flex-col gap-2 m-y-2">
            <label className="label">Deal Name</label>
            <input
              className="input"
              type="text"
              name="deal_name"
              defaultValue={deal_name}
            />
            <label className="label text-left">Account Name</label>
            <select className="select select-bordered" name="account_name">
              <option value={account_id}>{account_name}</option>
              {accountOptions?.map((account) => (
                <option key={account?.id} value={account?.id}>
                  {account?.Account_Name}
                </option>
              ))}
            </select>
            <label className="label">Email</label>
            <input
              className="input"
              type="text"
              name="email"
              defaultValue={email}
            />
          </div>
          <div className="flex flex-col gap-2 m-y-2">
            <label className="label">Amount</label>
            <input
              className="input"
              type="text"
              name="amount"
              defaultValue={amount}
            />
            <label className="label text-left">Status</label>
            <select className="select select-bordered" name="status">
              <option value={Status}>{Status}</option>
              {dealStatusOptions?.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption}
                </option>
              ))}
            </select>
            <label className="label">Website</label>
            <input
              className="input"
              name="website"
              type="text"
              defaultValue={website}
            />
          </div>
        </div>
        <button className="btn btn-neutral flex m-2" type="submit">
          Update
        </button>
      </form>
    </div>
  );
}
