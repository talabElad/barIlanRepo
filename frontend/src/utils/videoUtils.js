
export const groupVideosBySession = (videoList) => {
    return videoList.reduce((acc, video) => {
      const sessionName = video.unique_session_name || '';
      if (!acc[sessionName]) {
        acc[sessionName] = [];
      }
      acc[sessionName].push(video);
      return acc;
    }, {});
  };
  