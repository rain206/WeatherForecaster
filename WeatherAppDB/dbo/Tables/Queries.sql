CREATE TABLE [dbo].[Queries] (
    [Id]     INT            IDENTITY (1125, 3) NOT NULL,
    [Query]  NVARCHAR (256) NOT NULL,
    [UserId] NVARCHAR (256)            NOT NULL,
    [Date]   DATETIME       DEFAULT (getutcdate()) NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);