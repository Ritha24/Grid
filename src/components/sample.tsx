import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
} from '@mui/x-data-grid';
import SnackbarComponent from './snackbar';
import './sample.css';
import { CustomColumnMenu } from './CustomColumnHeader';

export default function FullFeaturedCrudGrid() {
  const [rows, setRows] = React.useState<GridRowsProp>([]);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
  const [open, setOpen] = React.useState(false);
  const [selectedRowId, setSelectedRowId] = React.useState<GridRowId | null>(null);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' as 'success' | 'info' | 'warning' | 'error' });

  React.useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/comments')
      .then((response) => response.json())
      .then((data) => setRows(data));
  }, []);

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    setOpen(true);
    setSelectedRowId(id);
  };

  const handleConfirmDelete = () => {
    if (selectedRowId !== null) {
      setRows(rows.filter((row) => row.id !== selectedRowId));
    }
    setOpen(false);
    setSelectedRowId(null);
  };

  const handleCancelDelete = () => {
    setOpen(false);
    setSelectedRowId(null);
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    if (!newRow.postId || !newRow.name || !newRow.email || !newRow.body) {
      setSnackbar({ open: true, message: 'All fields are required!', severity: 'error' });
      setRowModesModel((prevModel) => ({
        ...prevModel,
        [newRow.id]: { mode: GridRowModes.Edit },
      }));
      return;
    }

    const updatedRow = { ...newRow, isNew: false };
    setRows((oldRows) => {
      const newRows = oldRows.filter((row) => row.id !== newRow.id);
      return [...newRows, updatedRow];
    });
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleAddClick = () => {
    const id = Math.random().toString(36).substr(2, 9);
    setRows((oldRows) => [{ id, postId: '', name: '', email: '', body: '', isNew: true }, ...oldRows]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
    }));
  };

  const columns: GridColDef[] = [
    { field: 'postId', headerName: 'Post ID', width: 100, editable: true },
    { field: 'name', headerName: 'Name', width: 200, editable: true },
    { field: 'email', headerName: 'Email', width: 200, editable: true },
    { field: 'body', headerName: 'Body', width: 400, editable: true },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: 'primary.main',
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Box className="data-grid-container" sx={{ width: '100%', height: 600 }}>
      <div id="add-record-button">
      <Button
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAddClick}
      >
        Add record
      </Button>
      </div>
      <DataGrid
        rows={rows}
        columns={columns}
        checkboxSelection
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        rowHeight={45}
        components={{
          ColumnMenu: CustomColumnMenu,
        }}
      />
      <Dialog
        open={open}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this record?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <SnackbarComponent
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
}
