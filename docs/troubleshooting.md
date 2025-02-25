# Troubleshooting Guide

## Common Issues

### Extension Not Loading

**Symptoms:**
- Extension doesn't appear in VS Code
- Commands not available in command palette

**Solutions:**
1. Verify VS Code version (1.85.0+)
2. Check extension installation
3. Reload VS Code window
4. Check error logs in Output panel

### Tree Views Not Updating

**Symptoms:**
- Simulations not appearing
- Node status not refreshing

**Solutions:**
1. Check refresh interval setting
2. Verify data files exist
3. Restart extension
4. Clear workspace storage

### Cluster Status Issues

**Symptoms:**
- Missing node information
- Incorrect metrics display
- Panel not updating

**Solutions:**
1. Verify node configuration
2. Check network connectivity
3. Adjust refresh interval
4. Reset cluster configuration

### Simulation Creation Failures

**Symptoms:**
- Error when creating simulation
- Missing simulation details

**Solutions:**
1. Check input validation
2. Verify file permissions
3. Ensure unique simulation names
4. Check available storage

## Performance Issues

### High CPU Usage

**Solutions:**
1. Increase refresh interval
2. Reduce active simulations
3. Close unused panels
4. Check system resources

### Memory Leaks

**Solutions:**
1. Close unused webviews
2. Restart VS Code
3. Update extension
4. Monitor memory usage

## Error Messages

### "Cannot read property of undefined"

**Solutions:**
1. Check data initialization
2. Verify configuration loading
3. Reset workspace state
4. Reinstall extension

### "Command not found"

**Solutions:**
1. Reload VS Code
2. Check command registration
3. Verify extension activation
4. Update extension

## Configuration Issues

### Settings Not Saving

**Solutions:**
1. Check workspace permissions
2. Verify settings.json
3. Reset user settings
4. Use default configuration

### Invalid Configuration

**Solutions:**
1. Reset to defaults
2. Check syntax
3. Validate values
4. Clear cached settings

## Getting Help

If issues persist:
1. Check VS Code logs
2. Review documentation
3. Submit issue on GitHub
4. Contact support team

## Diagnostic Information

When reporting issues, include:
1. VS Code version
2. Extension version
3. Error messages
4. Steps to reproduce
5. System information
