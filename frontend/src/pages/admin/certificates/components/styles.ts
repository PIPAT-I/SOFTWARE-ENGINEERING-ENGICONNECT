export const customStyles = `
  /* Global Ant Design Overrides to Black */
  :root {
    --ant-primary-color-hover: black !important;
    --ant-primary-color-active: #333 !important;
  }
  
  .ant-btn-primary {
    background-color: black !important;
    border-color: black !important;
  }
  .ant-btn-primary:hover, .ant-btn-primary:focus {
    background-color: #333 !important;
    border-color: #333 !important;
  }
  
  .ant-btn:hover, .ant-btn:focus {
    color: black !important;
    border-color: black !important;
  }

  .ant-input:hover, .ant-input:focus, .ant-input-focused,
  .ant-input-affix-wrapper:hover, .ant-input-affix-wrapper-focused {
    border-color: black !important;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.06) !important;
  }

  .ant-upload.ant-upload-select-picture-card:hover,
  .ant-upload-list-picture-card-container:hover .ant-upload-list-item {
    border-color: black !important;
  }
  
  .ant-upload:hover .anticon, .ant-upload:hover div {
    color: black !important;
  }

  .ant-upload-list-item-actions .anticon {
    color: white !important; /* Keep icons white inside the black overlay on hover */
  }

  .ant-table-wrapper .ant-table-thead >tr>th {
    background-color: #fafafa;
  }

  .ant-pagination-item-active {
    border-color: black !important;
  }
  .ant-pagination-item-active a {
    color: black !important;
  }
  .ant-pagination-item:hover {
    border-color: black !important;
  }
  .ant-pagination-item:hover a {
    color: black !important;
  }

  .btn-outline-hover-black:hover {
    color: black !important;
    border-color: black !important;
  }
  .btn-outline-hover-black:hover .anticon {
    color: black !important;
  }

  .ant-card-cover img {
    object-fit: cover;
  }
`;
