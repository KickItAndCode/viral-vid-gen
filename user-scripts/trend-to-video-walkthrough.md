# ViralAI User Testing Script: Trend Discovery to Video Generation

## 🎯 Purpose
This script demonstrates the complete user flow from discovering trends to generating a viral video in ViralAI. This is designed for UI testing and user experience validation.

## 📋 Test Credentials
- **Email**: uiTester@gmail.com
- **Password**: Leetcode0!

## 🚀 User Flow Test Script

### Phase 1: Authentication & Dashboard Access
1. **Navigate to Application**
   - Open browser and go to `http://localhost:3000`
   - Verify the landing page loads correctly

2. **Sign In Process**
   - Click "Sign In" button
   - Enter email: `uiTester@gmail.com`
   - Enter password: `Leetcode0!`
   - Click "Sign In" button
   - Verify successful authentication and redirect to dashboard

3. **Dashboard Overview**
   - Verify dashboard loads with:
     - Welcome message
     - Quick stats (Videos Created, Trending Score, etc.)
     - Quick Create button
     - Explore Trends button
     - Recent Activity section

### Phase 2: Trend Discovery
4. **Access Trends Page**
   - Click "Explore Trends" button
   - Verify redirect to `/dashboard/trends`
   - Verify trends grid loads with trending topics

5. **Explore Trend Features**
   - Verify trend cards display:
     - Title and description
     - Viral score indicator
     - Platform badges (Reddit, Twitter, etc.)
     - Category tags
   - Test search functionality (search for "AI")
   - Test filter options (platform, category)
   - Test sorting options (viral score, date)

6. **Select a Trend**
   - Click on a trend card with high viral score
   - Verify trend preview modal opens
   - Review detailed metrics and engagement data
   - Click "Create Video" button

### Phase 3: Video Creation Wizard
7. **Step 1: Trend Selection**
   - Verify wizard opens with selected trend
   - Confirm trend details are populated
   - Click "Next" to continue

8. **Step 2: Style Configuration**
   - Select video style: "Comedy" or "Educational"
   - Choose target platform: "TikTok" (vertical format)
   - Set video duration: 15-30 seconds
   - Verify preview updates with selections
   - Click "Next" to continue

9. **Step 3: AI Configuration**
   - Select AI provider: "Veo 3" (recommended)
   - Choose quality: "Standard"
   - Set creativity level: "Balanced"
   - Add custom prompt (optional): "Make it engaging and fun"
   - Click "Generate Video" to start

10. **Step 4: Generation Progress**
    - Verify progress tracking displays:
      - Current stage (Analyzing, Generating, Creating, Finalizing)
      - Progress percentage
      - Estimated time remaining
      - Script preview (if available)
    - Wait for generation to complete (~1-2 minutes)

11. **Step 5: Preview & Export**
    - Verify video preview loads successfully
    - Test video player controls (play, pause, scrub)
    - Review generated content quality
    - Test export options:
      - Select format: MP4
      - Choose quality: 1080p
      - Click "Export Video"
    - Verify export process completes

### Phase 4: Video Management
12. **Video Library Access**
    - Navigate to "Library" from sidebar
    - Verify newly created video appears in library
    - Confirm video metadata:
      - Title based on trend
      - Generation timestamp
      - Viral score
      - Platform target
      - Status: "Completed"

13. **Video Library Features**
    - Test search functionality
    - Test filter options (status, style, date)
    - Test sorting options
    - Test video actions (view, download, share, edit)

### Phase 5: Advanced Editing (Optional)
14. **Video Editor Access**
    - Click "Edit" on a video or navigate to Editor
    - Verify editor workspace loads with:
      - Video preview panel
      - Timeline component
      - Assets sidebar
      - Controls panel

15. **Editor Features Test**
    - Test video playback controls
    - Test timeline scrubbing
    - Test caption editor (add text overlay)
    - Test visual effects panel (apply filter)
    - Test export functionality

## ✅ Success Criteria
- [ ] User can successfully authenticate
- [ ] Dashboard loads with all components
- [ ] Trends page displays trending content
- [ ] Trend filtering and search work correctly
- [ ] Video generation wizard completes successfully
- [ ] Generated video plays in preview
- [ ] Video export functionality works
- [ ] Video appears in library
- [ ] Video editor loads and basic functions work

## 🐛 Common Issues to Watch For
- Loading states and spinners display correctly
- Error messages are user-friendly
- Video generation doesn't timeout
- Player controls are responsive
- Export doesn't fail silently
- Navigation between pages works smoothly

## 📊 Performance Expectations
- Page load times: < 3 seconds
- Video generation: 1-2 minutes
- Export process: < 30 seconds
- Search/filter responses: < 1 second

## 🎬 Test Completion
Record observations for each phase and note any issues encountered. This script should take approximately 5-10 minutes to complete, depending on video generation time.

---

**Note**: This script is for UI testing purposes only. Test credentials and generated content are for demonstration and validation of the user experience flow.