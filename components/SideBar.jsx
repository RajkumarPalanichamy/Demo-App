import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemText, Divider, TextField, Grid, Button } from '@mui/material';
import Slider from '@mui/material/Slider';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

const Sidebar = ({
  side = "left",
  onWallCreate,
  modelLoad,
  splineEnabled,
  onEnableSpline,
  onAddPath,
  onPlaySpline,
  onStopSpline,
  splinePathLength,
  splineSpeed,
  onSplineSpeedChange
}) => {
  const [width, setWidth] = useState('20');
  const [height, setHeight] = useState('10');
  const [depth, setDepth] = useState('2');

  const handleCreateWall = () => {
    const wallData = { width, height, depth };
    onWallCreate(wallData);
  };

  const handleModelPath = (url) => {
    console.log(url);
    modelLoad(url);
  };

  return (
    <Drawer
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          position: 'absolute',
          borderRight: '1px solid #ddd',
        },
      }}
      variant="permanent"
      anchor={side}
    >
      {side === "left" && (
        <List>
          <ListItem>
            <ListItemText primary="Models" />
          </ListItem>
          <Divider />
          <ListItem button="true" onClick={() => handleModelPath('../public/door.glb')}>
            <ListItemText primary="Door" />
          </ListItem>
          <ListItem button="true" onClick={() => handleModelPath('../public/old_sofa.glb')}>
            <ListItemText primary="Sofa" />
          </ListItem>
          <ListItem button="true" onClick={() => handleModelPath('../public/table.glb')}>
            <ListItemText primary="Table" />
          </ListItem>
          <ListItem button="true" onClick={() => handleModelPath('../public/suzanne.glb')}>
            <ListItemText primary="Suzanne" />
          </ListItem>
        </List>
      )}

      {side === "right" && (
        <div style={{ padding: '16px' }}>
          <h3 style={{ padding: '10px' }} >Enter Wall Dimensions</h3>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                label="Width"
                variant="outlined"
                fullWidth
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Height"
                variant="outlined"
                fullWidth
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Depth"
                variant="outlined"
                fullWidth
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
              />
            </Grid>
            <Button
              variant="contained"
              onClick={handleCreateWall}
            >
              Create Wall
            </Button>
          </Grid>
          <Divider style={{ margin: '16px 0' }} />
          <Paper elevation={3} sx={{ p: 2, background: '#f8f9fa' }}>
            <Box mb={2}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Spline Path</span>
            </Box>
            <Stack spacing={2}>
              <Tooltip title={splineEnabled ? 'Disable spline path mode' : 'Enable spline path mode'} placement="right">
                <Button
                  variant={splineEnabled ? "contained" : "outlined"}
                  color="primary"
                  fullWidth
                  onClick={onEnableSpline}
                >
                  {splineEnabled ? "Spline Path Enabled" : "Enable Spline Path"}
                </Button>
              </Tooltip>
              <Tooltip title="Add a new point (sphere) to the path" placement="right">
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  onClick={onAddPath}
                  disabled={!splineEnabled}
                >
                  Add Path
                </Button>
              </Tooltip>
              <Tooltip title="Animate camera along the path" placement="right">
                <Button
                  variant="outlined"
                  color="success"
                  fullWidth
                  onClick={onPlaySpline}
                  disabled={!splineEnabled || splinePathLength < 2}
                >
                  Play
                </Button>
              </Tooltip>
              <Tooltip title="Stop and reset the path and animation" placement="right">
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={onStopSpline}
                  disabled={!splineEnabled}
                >
                  Stop
                </Button>
              </Tooltip>
              <Box mt={1}>
                <Box mb={1}>
                  <span style={{ fontWeight: 500 }}>Speed</span>
                </Box>
                <Slider
                  min={0.1}
                  max={5}
                  step={0.1}
                  value={splineSpeed}
                  onChange={(_, v) => onSplineSpeedChange(v)}
                  size="medium"
                  sx={{ width: '100%' }}
                />
                <Box mt={1} textAlign="center">
                  <span style={{ fontWeight: 500 }}>{splineSpeed.toFixed(1)}x</span>
                </Box>
              </Box>
            </Stack>
          </Paper>
        </div>
      )}
    </Drawer>
  );
};

export default Sidebar;
