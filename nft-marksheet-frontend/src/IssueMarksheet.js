import React, { useState } from "react";
import { getContract } from "./contract";
import { ethers, utils } from "ethers";

const IssueMarksheet = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    rollNumber: '',
    marks: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    try {
      if (!window.ethereum) return alert("MetaMask not installed!");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);

      const tx = await contract.issueMarksheet(formData.studentName, formData.rollNumber, formData.marks, {
        gasLimit: 3000000, // Increase gas limit if necessary
      });

      setStatus("⏳ Issuing...");
      await tx.wait();
      setStatus("✅ Marksheet issued successfully!");
    } catch (error) {
      console.error(error);
      setStatus("❌ Failed to issue marksheet");
    }
  };

  const [status, setStatus] = useState("");

  return (
    <div className="issue-marksheet">
      <h2>Issue New Marksheet</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Student Name:</label>
          <input
            type="text"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Roll Number:</label>
          <input
            type="text"
            name="rollNumber"
            value={formData.rollNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Marks:</label>
          <input
            type="number"
            name="marks"
            value={formData.marks}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Issue Marksheet
        </button>
      </form>
      <p>{status}</p>
    </div>
  );
};

export default IssueMarksheet;
