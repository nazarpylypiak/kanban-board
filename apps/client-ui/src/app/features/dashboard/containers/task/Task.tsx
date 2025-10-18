import { IColumn, ITask } from '@kanban-board/shared';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton, Typography } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../core/store';
import DragPreview from '../../components/task/DragPreview';
import { DropIndicator } from '../../components/task/DropIndicator';
import { ConfirmModal } from '../../modals/ConfirmModal';
import { useTaskDnD } from './hooks/useTaskDnD';
import { useTaskHandlers } from './hooks/useTaskHandlers';
import { TaskState } from './task-data';

interface TaskProps {
  column: IColumn;
  task: ITask;
  index: number;
}

const idle: TaskState = { type: 'idle' };

export default function Task({ task, column, index }: TaskProps) {
  const [state, setState] = useState<TaskState>(idle);
  const [showConfirm, setShowConfirm] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const isOwner = user?.id === task.ownerId;
  const [showActions, setShowActions] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const { ref } = useTaskDnD({
    column,
    task,
    index,
    onStateChange: setState,
    idle
  });
  const {
    handleCancelDelete,
    handleConfirmDelete,
    handleDeleteClick,
    handleComplete
  } = useTaskHandlers({ task, setShowConfirm });

  return (
    <>
      <Box
        ref={ref}
        onMouseEnter={() => {
          setShowActions(true);
          setShowCompleted(true);
        }}
        onMouseLeave={() => {
          setShowActions(false);
          setShowCompleted(false);
        }}
        sx={{
          p: 2,
          bgcolor: state.type === 'is-dragging' ? 'grey.100' : 'grey.50',
          borderRadius: 1,
          boxShadow: 1,
          cursor: 'grab',
          position: 'relative',
          transition: 'background-color 0.15s, opacity 0.2s',
          opacity: state.type === 'is-dragging' ? 0.4 : 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Checkbox
            checked={!!task.isDone}
            onChange={(e) => handleComplete(e.target.checked)}
            icon={
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  border: '2px solid',
                  borderColor: 'grey.400',
                  borderRadius: '50%'
                }}
              />
            }
            checkedIcon={
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: 'success.main',
                  border: '2px solid',
                  borderColor: 'success.main',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CheckIcon sx={{ color: 'common.white', fontSize: 16 }} />
              </Box>
            }
            sx={{
              transition: 'all 0.2s',
              transform:
                showCompleted || task.isDone ? 'scale(1)' : 'scale(0.5)',
              opacity: showCompleted || task.isDone ? 1 : 0
            }}
          />

          <Typography
            sx={{
              fontWeight: 600,
              flex: 1,
              textDecoration: task.isDone ? 'line-through' : 'none',
              color: task.isDone ? 'grey.500' : 'text.primary'
            }}
          >
            {task.title}
          </Typography>

          {isOwner && showActions && (
            <IconButton
              size="small"
              onClick={handleDeleteClick}
              sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.700' }}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>

        {task.description && (
          <Typography
            sx={{
              mt: 1,
              fontSize: '0.875rem',
              color: 'grey.600',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {task.description}
          </Typography>
        )}

        {task?.assignees?.length && (
          <Typography
            sx={{
              mt: 1,
              fontSize: '0.75rem',
              color: 'grey.600',
              display: 'flex',
              gap: 0.5
            }}
          >
            <Box component="span" sx={{ fontWeight: 500 }}>
              Assigned to:
            </Box>
            <Box
              component="span"
              title={task.assignees.map((a: any) => a.email).join(', ')}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {task.assignees.map((a: any) => a.email).join(', ')}
            </Box>
          </Typography>
        )}

        {showConfirm && (
          <ConfirmModal
            message="Are you sure you want to delete this task?"
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        )}

        {state.type === 'is-dragging-over' && state.closestEdge && (
          <DropIndicator edge={state.closestEdge} gap="8px" />
        )}
      </Box>

      {state.type === 'preview' && (
        <DragPreview task={task} container={state.container} />
      )}
    </>
  );
}
